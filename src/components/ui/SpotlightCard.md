# SpotlightCard

A premium interactive component from React Bits, refined for the Storix design system. It features a dynamic radial spotlight that follows the cursor, integrated with glassmorphism and high-fidelity noise textures.

## Features

- **Dynamic Spotlight**: A mouse-following radial gradient that creates depth and focus.
- **Glassmorphism**: Built-in 80% opacity background with `backdrop-blur-xl` for a premium layered feel.
- **Aesthetic Overlay**: High-fidelity noise texture for a professional, clinical look.
- **Seamless Tracking**: Dual-state logic ensures the spotlight remains active and responsive regardless of focus or hover order.
- **Accessibility**: Full support for `tabIndex` and keyboard focus-visible styling.

## Usage

```tsx
import SpotlightCard from '@/components/ui/SpotlightCard';

export default function MyComponent() {
  return (
    <SpotlightCard 
      className="p-12 h-64 flex flex-col justify-center" 
      spotlightColor="rgba(16, 185, 129, 0.2)"
    >
      <h3 className="text-2xl font-bold italic tracking-tight">PREMIUM FEATURE</h3>
      <p className="text-muted text-sm mt-4">
        Advanced interactivity with optimized rendering and zero performance overhead.
      </p>
    </SpotlightCard>
  );
}
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | `undefined` | The content to render inside the card (z-indexed above the light). |
| `className` | `string` | `""` | Additional CSS classes for custom layout or sizing. |
| `spotlightColor`| `string` | `'rgba(16, 185, 129, 0.15)'`| The CSS color (rgba() recommended) for the spotlight halo. |

## Why this is better than original React Bits

1. **State Persistence**: Original versions often "lose" the cursor position or opacity when focus and hover states overlap. This implementation uses boolean flags to maintain the halo correctly.
2. **Storix Theme**: Integration with the `noise-subtle` utility and the Emerald/Black color palette.
3. **Optimized Sizing**: Uses a `600px` circle with a `40%` falloff for a softer, more professional glow compared to sharp defaults.

---

*Part of the Storix Core UI Library.*
