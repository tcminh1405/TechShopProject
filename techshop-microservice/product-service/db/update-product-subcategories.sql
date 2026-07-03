USE techshop_productdb;

-- 1. Laptop Van Phong (Category 1)
UPDATE products SET subcategory = 'Office' WHERE category_id = 1;

-- 2. Laptop Gaming (Category 2)
UPDATE products SET subcategory = 'Gaming' WHERE category_id = 2;

-- 3. PC (Category 3)
UPDATE products SET subcategory = 'Gaming' WHERE id IN (13, 15, 17);
UPDATE products SET subcategory = 'Office' WHERE id = 14;
UPDATE products SET subcategory = 'Workstation' WHERE id = 16;

-- 4. Monitor (Category 4)
UPDATE products SET subcategory = 'Gaming' WHERE id IN (18, 20, 21, 22, 23);
UPDATE products SET subcategory = 'Office' WHERE id = 19;

-- 5. Keyboard (Category 5)
UPDATE products SET subcategory = 'Mechanical' WHERE category_id = 5;

-- 6. Mouse (Category 6)
UPDATE products SET subcategory = 'Gaming' WHERE id IN (29, 30, 32, 33, 34);
UPDATE products SET subcategory = 'Office' WHERE id = 31;

-- 7. Headphone (Category 7)
UPDATE products SET subcategory = 'Gaming' WHERE id IN (35, 36, 37, 38, 40);
UPDATE products SET subcategory = 'Bluetooth' WHERE id = 39;

-- 8. Chair (Category 8)
UPDATE products SET subcategory = 'Chair' WHERE id IN (41, 42, 43, 44);
UPDATE products SET subcategory = 'Table' WHERE id = 45;

-- 9. Console (Category 9)
UPDATE products SET subcategory = 'Console' WHERE id IN (46, 49);
UPDATE products SET subcategory = 'Controller' WHERE id IN (47, 48, 50);

-- 10. Accessory (Category 10)
UPDATE products SET subcategory = 'Hub', accessory_type = 'hub' WHERE id = 51;
UPDATE products SET subcategory = 'Cable', accessory_type = 'cap-sac' WHERE id = 52;
UPDATE products SET subcategory = 'Mousepad', accessory_type = 'lot-chuot' WHERE id = 53;
UPDATE products SET subcategory = 'Bag', accessory_type = 'tui-chong-soc' WHERE id = 54;
UPDATE products SET subcategory = 'Charger', accessory_type = 'cu-sac' WHERE id = 55;
UPDATE products SET subcategory = 'Cooler', accessory_type = 'de-tan-nhiet' WHERE id = 56;

-- New products (65-87) subcategories
-- Monitor (Category 4)
UPDATE products SET subcategory = 'Gaming' WHERE id IN (65, 66);

-- Mouse (Category 6)
UPDATE products SET subcategory = 'Gaming' WHERE id = 70;
UPDATE products SET subcategory = 'Office' WHERE id = 71;

-- Console (Category 9)
UPDATE products SET subcategory = 'Console' WHERE id = 72;

-- Accessories (Category 10)
UPDATE products SET subcategory = 'Charger', accessory_type = 'cu-sac' WHERE id = 73;
UPDATE products SET subcategory = 'Bag', accessory_type = 'tui-chong-soc' WHERE id = 74;
UPDATE products SET subcategory = 'Combo', accessory_type = 'chuot-ban-phim' WHERE id = 75;
UPDATE products SET subcategory = 'Stand', accessory_type = 'de-tan-nhiet' WHERE id = 76;

-- SSD/RAM (Category 11)
UPDATE products SET subcategory = 'SSD' WHERE id IN (77, 78, 79);
UPDATE products SET subcategory = 'RAM' WHERE id = 80;

-- Main/CPU/VGA (Category 12)
UPDATE products SET subcategory = 'Mainboard' WHERE id IN (81, 82);
UPDATE products SET subcategory = 'VGA' WHERE id = 83;
UPDATE products SET subcategory = 'CPU' WHERE id = 84;

-- Loa/Micro/Webcam (Category 13)
UPDATE products SET subcategory = 'Loa' WHERE id = 85;
UPDATE products SET subcategory = 'Micro' WHERE id = 86;
UPDATE products SET subcategory = 'Webcam' WHERE id = 87;

