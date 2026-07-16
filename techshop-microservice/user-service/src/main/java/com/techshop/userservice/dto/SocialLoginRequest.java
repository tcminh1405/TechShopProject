package com.techshop.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SocialLoginRequest {

    @NotBlank(message = "Authorization code không được để trống")
    private String code;
}
