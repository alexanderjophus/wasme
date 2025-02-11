use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn gaussian_blur(pixels: &mut [u8], width: u32, height: u32, kernel_size: usize) {
    let sigma = 1.0;
    let kernel = create_gaussian_kernel(kernel_size, sigma);

    let mut result = vec![0; (width * height * 4) as usize];

    let padding = (kernel_size / 2) as isize;

    for y in 0..height {
        for x in 0..width {
            let mut r = 0.0;
            let mut g = 0.0;
            let mut b = 0.0;

            for ky in 0..kernel_size {
                for kx in 0..kernel_size {
                    let px = x as isize + kx as isize - padding;
                    let py = y as isize + ky as isize - padding;

                    if px >= 0 && px < width as isize && py >= 0 && py < height as isize {
                        let i = (py * width as isize + px) as usize * 4;
                        r += pixels[i] as f32 * kernel[ky][kx];
                        g += pixels[i + 1] as f32 * kernel[ky][kx];
                        b += pixels[i + 2] as f32 * kernel[ky][kx];
                    }
                }
            }

            let i = (y * width + x) as usize * 4;
            result[i] = r as u8;
            result[i + 1] = g as u8;
            result[i + 2] = b as u8;
            result[i + 3] = pixels[i + 3];
        }
    }

    pixels.copy_from_slice(&result);
}

fn create_gaussian_kernel(size: usize, sigma: f32) -> Vec<Vec<f32>> {
    let mut kernel = vec![vec![0.0; size]; size];
    let center = size / 2;

    // Calculate 2D Gaussian distribution
    for y in 0..size {
        for x in 0..size {
            let dx = x as i32 - center as i32;
            let dy = y as i32 - center as i32;
            kernel[y][x] = (-((dx * dx + dy * dy) as f32) / (2.0 * sigma * sigma)).exp();
        }
    }

    // Normalize kernel so weights sum to 1
    let total: f32 = kernel.iter().map(|row| row.iter().sum::<f32>()).sum();
    for row in kernel.iter_mut() {
        for value in row.iter_mut() {
            *value /= total;
        }
    }

    kernel
}
