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

#[wasm_bindgen]
pub fn edge_detection(pixels: &mut [u8]) {
    // Simple edge detection using brightness differences
    // Note: This is a simplified version that works on the current frame only
    let temp = pixels.to_vec();
    let len = pixels.len();
    pixels
        .chunks_exact_mut(4)
        .enumerate()
        .for_each(|(i, chunk)| {
            if i > 0 && i < len / 4 - 1 {
                let prev = ((temp[i * 4] as i16 + temp[i * 4 + 1] as i16 + temp[i * 4 + 2] as i16)
                    / 3) as i16;
                let next = ((temp[(i + 1) * 4] as i16
                    + temp[(i + 1) * 4 + 1] as i16
                    + temp[(i + 1) * 4 + 2] as i16)
                    / 3) as i16;
                let edge = ((prev - next).abs() as u8).saturating_mul(2);
                chunk[0] = edge;
                chunk[1] = edge;
                chunk[2] = edge;
            }
        });
}
