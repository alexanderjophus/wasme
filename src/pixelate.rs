use wasm_bindgen::prelude::wasm_bindgen;

use crate::utils;

#[wasm_bindgen]
pub fn pixelate(pixels: &mut [u8], width: u32, height: u32, pixel_size: u32) {
    utils::set_panic_hook();
    let mut new_pixels = vec![0; pixels.len()];
    let mut new_pixel = [0; 4];
    for y in 0..height / pixel_size {
        for x in 0..width / pixel_size {
            let mut sum = [0 as u32; 4];
            for y_offset in 0..pixel_size {
                for x_offset in 0..pixel_size {
                    let x = x * pixel_size + x_offset;
                    let y = y * pixel_size + y_offset;
                    let i = (y * width + x) as usize * 4;
                    sum[0] += pixels[i] as u32;
                    sum[1] += pixels[i + 1] as u32;
                    sum[2] += pixels[i + 2] as u32;
                    sum[3] += pixels[i + 3] as u32;
                }
            }
            let pixel_count = pixel_size * pixel_size;
            new_pixel[0] = (sum[0] as u32 / pixel_count) as u8;
            new_pixel[1] = (sum[1] as u32 / pixel_count) as u8;
            new_pixel[2] = (sum[2] as u32 / pixel_count) as u8;
            new_pixel[3] = (sum[3] as u32 / pixel_count) as u8;
            for y_offset in 0..pixel_size {
                for x_offset in 0..pixel_size {
                    let x = x * pixel_size + x_offset;
                    let y = y * pixel_size + y_offset;
                    let i = (y * width + x) as usize * 4;
                    new_pixels[i..i + 4].copy_from_slice(&new_pixel);
                }
            }
        }
    }

    pixels.copy_from_slice(&new_pixels);
}
