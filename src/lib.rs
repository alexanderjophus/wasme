mod blur;
mod edges;
mod emboss;
mod pixelate;
mod utils;

use std::u8;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn invert_colors(pixels: &mut [u8]) {
    utils::set_panic_hook();
    pixels.chunks_exact_mut(4).for_each(|chunk| {
        // Invert RGB values, leave alpha unchanged
        chunk[0] = 255 - chunk[0]; // R
        chunk[1] = 255 - chunk[1]; // G
        chunk[2] = 255 - chunk[2]; // B
    });
}

#[wasm_bindgen]
pub fn greyscale(pixels: &mut [u8]) {
    utils::set_panic_hook();
    pixels.chunks_exact_mut(4).for_each(|chunk| {
        let r = chunk[0] as f32;
        let g = chunk[1] as f32;
        let b = chunk[2] as f32;
        let gray = (0.3 * r + 0.59 * g + 0.11 * b) as u8;
        chunk[0] = gray;
        chunk[1] = gray;
        chunk[2] = gray;
    });
}

#[wasm_bindgen]
pub fn threshold(pixels: &mut [u8], threshold: u8) {
    utils::set_panic_hook();
    pixels.chunks_exact_mut(4).for_each(|chunk| {
        let r = chunk[0];
        let g = chunk[1];
        let b = chunk[2];
        let gray = (0.3 * r as f32 + 0.59 * g as f32 + 0.11 * b as f32) as u8;
        let new_value = if gray > threshold { 255 } else { 0 };
        chunk[0] = new_value;
        chunk[1] = new_value;
        chunk[2] = new_value;
    });
}

// flips horizontally
#[wasm_bindgen]
pub fn flip(pixels: &mut [u8], width: u32, height: u32) {
    utils::set_panic_hook();
    let mut result = vec![0u8; pixels.len()];
    for y in 0..height {
        let row_offset = y * width * 4;

        // Process each pixel in the row
        for x in 0..width {
            let src_pixel = row_offset + (x * 4);
            let dst_pixel = row_offset + ((width - 1 - x) * 4);

            // Copy RGBA values
            result[dst_pixel as usize] = pixels[src_pixel as usize]; // Red
            result[dst_pixel as usize + 1] = pixels[src_pixel as usize + 1]; // Green
            result[dst_pixel as usize + 2] = pixels[src_pixel as usize + 2]; // Blue
            result[dst_pixel as usize + 3] = pixels[src_pixel as usize + 3]; // Alpha
        }
    }
    pixels.copy_from_slice(&result);
}

#[wasm_bindgen]
pub fn colorize(pixels: &mut [u8], r: u8, g: u8, b: u8) {
    utils::set_panic_hook();
    pixels.chunks_exact_mut(4).for_each(|chunk| {
        // Apply color to RGB values, leave alpha unchanged
        chunk[0] = (chunk[0].saturating_add(r)).clamp(0, 255) as u8;
        chunk[1] = (chunk[1].saturating_add(g)).clamp(0, 255) as u8;
        chunk[2] = (chunk[2].saturating_add(b)).clamp(0, 255) as u8;
    });
}

fn get_row_col(i: usize, width: u32) -> (u32, u32) {
    if i < width as usize {
        return (0, i as u32);
    }

    let row = i as u32 / width;
    let col = i as u32 % width;
    (row, col)
}
