# Wasme

A small website that plays around with camera feeds and image processing using WebAssembly.

```bash
RUSTFLAGS='--cfg getrandom_backend="wasm_js"' wasm-pack build --target web
cd www && npm install
cd www && npx tailwindcss -i styles.css -o public/styles.css --watch # In a separate terminal
cd www && npm run start # In a separate terminal
```
