package com.techshop.userservice.service;

import com.techshop.userservice.constant.KafkaTopicConstants;
import com.techshop.userservice.dto.AuthResponse;
import com.techshop.userservice.dto.LoginRequest;
import com.techshop.userservice.dto.RegisterRequest;
import com.techshop.userservice.dto.SocialLoginRequest;
import com.techshop.userservice.enums.ErrorCode;
import com.techshop.userservice.event.UserRegisteredEvent;
import com.techshop.userservice.exception.AppException;
import com.techshop.userservice.model.Role;
import com.techshop.userservice.model.User;
import com.techshop.userservice.repository.UserRepository;
import com.techshop.userservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OutboxService outboxService;
    private final RestTemplate restTemplate;

    @Value("${oauth2.facebook.client-id}")
    private String fbClientId;

    @Value("${oauth2.facebook.client-secret}")
    private String fbClientSecret;

    @Value("${oauth2.facebook.redirect-uri}")
    private String fbRedirectUri;

    @Value("${oauth2.google.client-id}")
    private String googleClientId;

    @Value("${oauth2.google.client-secret}")
    private String googleClientSecret;

    @Value("${oauth2.google.redirect-uri}")
    private String googleRedirectUri;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Register request: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(Role.CUSTOMER)
                .build();

        user = userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();

        outboxService.saveEvent(
                "User",
                String.valueOf(user.getId()),
                "UserRegistered",
                KafkaTopicConstants.USER_REGISTERED_TOPIC,
                String.valueOf(user.getId()),
                event
        );

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole().name())
                .message("Đăng ký thành công!")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login request: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!user.isEnabled()) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole().name())
                .message("Đăng nhập thành công!")
                .build();
    }

    public AuthResponse checkToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AppException(ErrorCode.MISSING_TOKEN);
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        String role = jwtUtil.extractRole(token);

        if (email == null) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(role)
                .build();
    }

    @Transactional
    public AuthResponse loginFacebook(SocialLoginRequest request) {
        log.info("Facebook Login request code: {}", request.getCode());
        try {
            // 1. Exchange code for Facebook Access Token
            String tokenUrl = "https://graph.facebook.com/v18.0/oauth/access_token?client_id=" + fbClientId 
                    + "&redirect_uri=" + fbRedirectUri 
                    + "&client_secret=" + fbClientSecret 
                    + "&code=" + request.getCode();
            
            Map<String, Object> tokenResponse = restTemplate.getForObject(tokenUrl, Map.class);
            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                throw new AppException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
            }
            String accessToken = (String) tokenResponse.get("access_token");

            // 2. Fetch Facebook User Info
            String infoUrl = "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=" + accessToken;
            Map<String, Object> userInfo = restTemplate.getForObject(infoUrl, Map.class);
            if (userInfo == null || !userInfo.containsKey("id")) {
                throw new AppException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
            }

            String facebookId = (String) userInfo.get("id");
            String name = (String) userInfo.get("name");
            String email = (String) userInfo.get("email");
            if (email == null || email.trim().isEmpty()) {
                email = facebookId + "@facebook.com";
            }

            String avatarUrl = null;
            if (userInfo.containsKey("picture")) {
                Map<String, Object> picture = (Map<String, Object>) userInfo.get("picture");
                if (picture != null && picture.containsKey("data")) {
                    Map<String, Object> data = (Map<String, Object>) picture.get("data");
                    if (data != null) {
                        avatarUrl = (String) data.get("url");
                    }
                }
            }

            // 3. Register or Link Account
            User user = userRepository.findByFacebookId(facebookId).orElse(null);
            if (user == null) {
                // If not found by facebookId, search by email to link
                user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    user.setFacebookId(facebookId);
                    if (user.getAvatarUrl() == null) {
                        user.setAvatarUrl(avatarUrl);
                    }
                    user = userRepository.save(user);
                    log.info("Linked existing user {} to facebookId {}", email, facebookId);
                } else {
                    // Create new user (Bypass OTP, already verified by Facebook)
                    user = User.builder()
                            .fullName(name)
                            .email(email)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .avatarUrl(avatarUrl)
                            .facebookId(facebookId)
                            .role(Role.CUSTOMER)
                            .enabled(true)
                            .build();
                    user = userRepository.save(user);
                    log.info("Registered new user via Facebook: {}", email);

                    // Publish UserRegistered event to Outbox so they get Welcome Email
                    UserRegisteredEvent event = UserRegisteredEvent.builder()
                            .userId(user.getId())
                            .email(user.getEmail())
                            .fullName(user.getFullName())
                            .build();

                    outboxService.saveEvent(
                            "User",
                            String.valueOf(user.getId()),
                            "UserRegistered",
                            KafkaTopicConstants.USER_REGISTERED_TOPIC,
                            String.valueOf(user.getId()),
                            event
                    );
                }
            } else {
                // If facebookId is already linked but email is different or needs sync
                if (avatarUrl != null && !avatarUrl.equals(user.getAvatarUrl())) {
                    user.setAvatarUrl(avatarUrl);
                    user = userRepository.save(user);
                }
            }

            if (!user.isEnabled()) {
                throw new AppException(ErrorCode.ACCOUNT_LOCKED);
            }

            String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
            return AuthResponse.builder()
                    .token(jwtToken)
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .address(user.getAddress())
                    .role(user.getRole().name())
                    .message("Đăng nhập bằng Facebook thành công!")
                    .build();

        } catch (Exception e) {
            log.error("Facebook Login failed: ", e);
            throw new AppException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }
    }

    @Transactional
    public AuthResponse loginGoogle(SocialLoginRequest request) {
        log.info("Google Login request code: {}", request.getCode());
        try {
            // 1. Exchange code for Google Access Token
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("code", request.getCode());
            map.add("client_id", googleClientId);
            map.add("client_secret", googleClientSecret);
            map.add("redirect_uri", googleRedirectUri);
            map.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(map, headers);
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity("https://oauth2.googleapis.com/token", requestEntity, Map.class);
            Map<String, Object> tokenResponse = responseEntity.getBody();
            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                throw new AppException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
            }
            String accessToken = (String) tokenResponse.get("access_token");

            // 2. Fetch Google User Info
            String infoUrl = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken;
            Map<String, Object> userInfo = restTemplate.getForObject(infoUrl, Map.class);
            if (userInfo == null || !userInfo.containsKey("sub")) {
                throw new AppException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
            }

            String googleId = (String) userInfo.get("sub");
            String name = (String) userInfo.get("name");
            String email = (String) userInfo.get("email");
            if (email == null || email.trim().isEmpty()) {
                email = googleId + "@google.com";
            }
            String avatarUrl = (String) userInfo.get("picture");

            // 3. Register or Link Account
            User user = userRepository.findByGoogleId(googleId).orElse(null);
            if (user == null) {
                // If not found by googleId, search by email to link
                user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    user.setGoogleId(googleId);
                    if (user.getAvatarUrl() == null) {
                        user.setAvatarUrl(avatarUrl);
                    }
                    user = userRepository.save(user);
                    log.info("Linked existing user {} to googleId {}", email, googleId);
                } else {
                    // Create new user (Bypass OTP)
                    user = User.builder()
                            .fullName(name)
                            .email(email)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .avatarUrl(avatarUrl)
                            .googleId(googleId)
                            .role(Role.CUSTOMER)
                            .enabled(true)
                            .build();
                    user = userRepository.save(user);
                    log.info("Registered new user via Google: {}", email);

                    // Publish UserRegistered event to Outbox
                    UserRegisteredEvent event = UserRegisteredEvent.builder()
                            .userId(user.getId())
                            .email(user.getEmail())
                            .fullName(user.getFullName())
                            .build();

                    outboxService.saveEvent(
                            "User",
                            String.valueOf(user.getId()),
                            "UserRegistered",
                            KafkaTopicConstants.USER_REGISTERED_TOPIC,
                            String.valueOf(user.getId()),
                            event
                    );
                }
            } else {
                // Sync avatarUrl
                if (avatarUrl != null && !avatarUrl.equals(user.getAvatarUrl())) {
                    user.setAvatarUrl(avatarUrl);
                    user = userRepository.save(user);
                }
            }

            if (!user.isEnabled()) {
                throw new AppException(ErrorCode.ACCOUNT_LOCKED);
            }

            String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
            return AuthResponse.builder()
                    .token(jwtToken)
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .address(user.getAddress())
                    .role(user.getRole().name())
                    .message("Đăng nhập bằng Google thành công!")
                    .build();

        } catch (Exception e) {
            log.error("Google Login failed: ", e);
            throw new AppException(ErrorCode.OAUTH_AUTHENTICATION_FAILED);
        }
    }
}
