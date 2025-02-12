use wasm_bindgen::prelude::wasm_bindgen;

use crate::greyscale;

#[wasm_bindgen]
pub fn emboss(pixels: &mut [u8], width: usize, height: usize, is_horizontal: bool) {
    // Define kernels for horizontal and vertical embossing
    let horizontal_kernel: [[i32; 3]; 3] = [[0, -1, 0], [0, 0, 0], [0, 1, 0]];

    let vertical_kernel: [[i32; 3]; 3] = [[0, 0, 0], [-1, 0, 1], [0, 0, 0]];

    // Select kernel based on direction
    let kernel = if is_horizontal {
        horizontal_kernel
    } else {
        vertical_kernel
    };

    // Create output array
    let mut result = vec![0u8; pixels.len()];

    // Process each pixel
    for y in 0..height {
        for x in 0..width {
            // Process each color channel (R,G,B)
            for c in 0..3 {
                let mut sum: i32 = 0;

                // Apply kernel to neighboring pixels
                for ky in -1..=1 {
                    for kx in -1..=1 {
                        // Calculate neighboring pixel position
                        let nx = x as i32 + kx;
                        let ny = y as i32 + ky;

                        // Skip if outside image bounds
                        if nx < 0 || nx >= width as i32 || ny < 0 || ny >= height as i32 {
                            continue;
                        }

                        // Get kernel weight
                        let weight = kernel[(ky + 1) as usize][(kx + 1) as usize];

                        // Calculate index in the pixel array
                        let pixel_idx = (ny as usize * width + nx as usize) * 4 + c;

                        // Add weighted pixel value
                        sum += pixels[pixel_idx] as i32 * weight;
                    }
                }

                sum = (sum + 128).clamp(0, 255);

                // Store result
                let result_idx = (y * width + x) * 4 + c;
                result[result_idx] = sum as u8;
            }

            // Copy alpha channel unchanged
            let alpha_idx = (y * width + x) * 4 + 3;
            result[alpha_idx] = pixels[alpha_idx];
        }
    }

    pixels.copy_from_slice(&result);
}

#[wasm_bindgen]
pub fn emboss_grayscale(pixels: &mut [u8], width: usize, height: usize, is_horizontal: bool) {
    // Convert to grayscale first
    greyscale(pixels);

    // Apply emboss to grayscale image
    emboss(pixels, width, height, is_horizontal)
}
