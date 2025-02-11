use wasm_bindgen::prelude::wasm_bindgen;

use crate::{blur::gaussian_blur, get_row_col, greyscale, utils};

#[wasm_bindgen]
pub fn edge_detection(pixels: &mut [u8], width: u32, height: u32, kernel_size: usize) {
    utils::set_panic_hook();
    // Implementation of Canny Edge Detection in rust
    // https://en.wikipedia.org/wiki/Canny_edge_detector

    greyscale(pixels);

    gaussian_blur(pixels, width, height, kernel_size);

    let (gradient_magnitude, gradient_direction) = compute_gradients(&pixels, width, height);

    non_maximum_suppression(
        pixels,
        &gradient_magnitude,
        &gradient_direction,
        width,
        height,
    );

    apply_double_threshold(pixels, &gradient_magnitude, width, height);

    hysteresis(pixels, width, height);
}

fn compute_gradients(pixels: &[u8], width: u32, height: u32) -> (Vec<f32>, Vec<f32>) {
    let mut gradient_magnitude = vec![0.0; (width * height) as usize];
    let mut gradient_direction = vec![0.0; (width * height) as usize];

    for i in 0..(width * height) as usize {
        let (row, col) = get_row_col(i, width);

        // for each pixel in the image not on the border of the image
        if row <= 0 || row >= height - 1 || col <= 0 || col >= width - 1 {
            continue;
        }

        let mut gx = 0.0;
        let mut gy = 0.0;
        for ky in 0..3 {
            for kx in 0..3 {
                let img_x = row + kx - 1;
                let img_y = col + ky - 1;
                let pixel = pixels[(img_x * width + img_y) as usize * 4];
                gx += pixel as f32 * SOBEL_FILTER_X[ky as usize][kx as usize];
                gy += pixel as f32 * SOBEL_FILTER_Y[ky as usize][kx as usize];
            }
        }

        let magnitude = (gx * gx + gy * gy).sqrt();
        let direction = gy.atan2(gx);

        gradient_magnitude[i] = magnitude;
        gradient_direction[i] = direction;
    }

    (gradient_magnitude, gradient_direction)
}

fn non_maximum_suppression(
    pixels: &mut [u8],
    gradient_magnitude: &[f32],
    gradient_direction: &[f32],
    width: u32,
    height: u32,
) {
    pixels
        .chunks_exact_mut(4)
        .enumerate()
        .for_each(|(i, chunk)| {
            let (row, col) = get_row_col(i, width);

            // for each pixel in the image not on the border of the image
            if row <= 0 || row >= height - 1 || col <= 0 || col >= width - 1 {
                return;
            }

            // let idx = row * width + col;
            let direction = gradient_direction[i];
            let magnitude = gradient_magnitude[i];
            let mut angle = direction.to_degrees();
            if angle < 0.0 {
                angle += 180.0;
            }

            let (n1_index, n2_index) = match angle {
                a if a <= 22.5 || a > 157.5 => {
                    (i - 1, i + 1) // horizontal
                }
                a if a <= 67.5 => {
                    (i + width as usize - 1, i - width as usize + 1) // diagonal
                }
                a if a <= 112.5 => {
                    (i - width as usize, i + width as usize) // vertical
                }
                _ => {
                    (i - width as usize - 1, i + width as usize + 1) // diagonal
                }
            };

            if magnitude >= gradient_magnitude[n1_index]
                && magnitude >= gradient_magnitude[n2_index]
            {
                chunk[0] = magnitude as u8;
                chunk[1] = magnitude as u8;
                chunk[2] = magnitude as u8;
            }
        });
}

fn apply_double_threshold(pixels: &mut [u8], gradient_magnitude: &[f32], width: u32, height: u32) {
    pixels
        .chunks_exact_mut(4)
        .enumerate()
        .for_each(|(i, chunk)| {
            let (row, col) = get_row_col(i, width);

            // for each pixel in the image not on the border of the image
            if row <= 0 || row >= height - 1 || col <= 0 || col >= width - 1 {
                return;
            }

            let idx = row * width + col;
            let val = if gradient_magnitude[idx as usize] >= 75.0 {
                255
            } else if gradient_magnitude[idx as usize] <= 25.0 {
                0
            } else {
                128
            };
            chunk[0] = val;
            chunk[1] = val;
            chunk[2] = val;
        });
}

fn hysteresis(pixels: &mut [u8], width: u32, height: u32) {
    // Helper function to check if any neighbor is a strong edge
    let has_strong_neighbor = |x: u32, y: u32, img: &[u8]| {
        for dy in -1..=1 {
            for dx in -1..=1 {
                if dx == 0 && dy == 0 {
                    continue;
                }

                let nx = x as i32 + dx;
                let ny = y as i32 + dy;

                if nx >= 0 && nx < width as i32 && ny >= 0 && ny < height as i32 {
                    let index = ((ny as u32) * width + nx as u32) as usize;
                    if img[index] == 255 {
                        return true;
                    }
                }
            }
        }
        false
    };

    // Process weak edges
    for y in 0..height {
        for x in 0..width {
            let index = (y * width + x) as usize;
            if pixels[index] == 128 {
                if has_strong_neighbor(x, y, pixels) {
                    pixels[index] = 255;
                } else {
                    pixels[index] = 0;
                }
            }
        }
    }
}

const SOBEL_FILTER_X: [[f32; 3]; 3] = [[-1.0, 0.0, 1.0], [-2.0, 0.0, 2.0], [-1.0, 0.0, 1.0]];
const SOBEL_FILTER_Y: [[f32; 3]; 3] = [[-1.0, -2.0, -1.0], [0.0, 0.0, 0.0], [1.0, 2.0, 1.0]];
