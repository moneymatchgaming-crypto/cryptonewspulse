# Logo Setup Instructions

## 📁 Logo Files Location

Your logo files should be placed in the `public/` folder:

```
crypto-news/public/
├── logo.svg          # Main logo (SVG format recommended)
├── logo.png          # Alternative PNG version
├── logo@2x.png       # High-resolution version for retina displays
├── favicon.ico       # Browser favicon
├── favicon-16x16.png # Small favicon
├── favicon-32x32.png # Standard favicon
└── apple-touch-icon.png # iOS home screen icon
```

## 🎨 Logo Specifications

### Main Logo (`logo.svg` or `logo.png`)
- **Recommended size**: 200x50px (SVG) or 400x100px (PNG)
- **Format**: SVG (preferred) or PNG with transparency
- **Colors**: Should work well on dark backgrounds
- **Position**: Top left corner of the website

### Favicon (`favicon.ico`)
- **Size**: 16x16, 32x32, and 48x48 pixels
- **Format**: ICO file (multi-size)
- **Colors**: Should be recognizable at small sizes

## 🔄 How to Replace the Logo

1. **Replace the placeholder files**:
   - Replace `logo.svg` with your official logo
   - Replace `favicon.ico` with your official favicon

2. **Update the Header component** (if needed):
   - The logo is already configured in `src/components/Header.tsx`
   - It will automatically load from `/logo.svg`
   - If you prefer PNG, change the src to `/logo.png`

3. **Test the logo**:
   - Run `npm run dev` to see your logo in action
   - Check both desktop and mobile views
   - Verify the logo looks good on different screen sizes

## 📱 Responsive Design

The logo is configured to:
- Scale appropriately on different screen sizes
- Maintain aspect ratio
- Have a fallback text if the image fails to load
- Be clickable (links to home page)

## 🎯 Best Practices

- **SVG format**: Preferred for logos as they scale perfectly
- **Transparent background**: Allows the logo to blend with the site design
- **High contrast**: Ensure visibility on the dark theme
- **Simple design**: Should be recognizable at small sizes
- **Consistent branding**: Match your overall brand colors and style

## 🔧 Customization Options

If you need to adjust the logo display:

1. **Size**: Modify the `h-10` class in Header.tsx
2. **Position**: Adjust the flexbox classes
3. **Fallback**: Customize the fallback text styling
4. **Animation**: Add hover effects or transitions

## 📋 Checklist

- [ ] Replace `logo.svg` with your official logo
- [ ] Replace `favicon.ico` with your official favicon
- [ ] Test logo on desktop and mobile
- [ ] Verify logo looks good on different screen sizes
- [ ] Check that the logo is clickable and links to home
- [ ] Ensure fallback text works if logo fails to load 