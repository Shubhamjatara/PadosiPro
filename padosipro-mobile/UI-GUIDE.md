# PadosiPro UI: beginner guide

The main screens use React Native `View`, `Text`, `StyleSheet`, and the already installed React Native Paper buttons and inputs. No new UI package is needed.

## Start with these three files

1. `src/constants/ui.ts`: common colors and styles.
2. `src/components/custom/AuthScreen.tsx`: the shared page layout for Login, Register, and OTP.
3. `src/components/custom/AppShell.tsx`: the shared header and sidebar for Home, Services, and Profile.

## How styling works

```tsx
<View style={ui.card}>
  <Text style={ui.sectionTitle}>Personal details</Text>
  <Text style={ui.body}>Keep your details up to date.</Text>
</View>
```

- `View` is a container, similar to a `div` on the web.
- `Text` displays text.
- `padding` adds space inside a container.
- `gap` adds space between its children.
- `borderRadius` rounds the corners.
- `flex: 1` uses the available space.
- `flexDirection: "row"` places children next to each other.

`ui.card` is just a named style. You can open `ui.ts` and see every value. For example, changing its `padding` from `20` to `24` adds more space inside all cards.

## Why reuse a wrapper?

```tsx
<AuthScreen title="Welcome back" subtitle="Sign in to your account.">
  {/* This screen's inputs and button go here. */}
</AuthScreen>
```

The inputs become `children`. `AuthScreen` places them inside the same card and handles scrolling and keyboard spacing. The form logic stays in the screen file.

## State, events, and lists

- `useState` remembers values such as an email, selected services, or whether the sidebar is open.
- `onPress` runs a function when a button is tapped.
- `onChangeText` updates state when the user types.
- `.map()` turns a small array into repeated UI items.
- `FlatList` displays the service lists.
- A loading indicator means the request is running; an error message explains when it failed.

## Navigation

`src/app/(tabs)/_layout.tsx` wraps the tabs in `AppShell`, so the hamburger button appears on every tab. The sidebar closes before navigating to a selected screen.

## Small exercises

1. Change `palette.primary` in `ui.ts` and inspect the form buttons.
2. Change the Login subtitle in `(auth)/login.tsx`.
3. Change `ui.card.borderRadius` and inspect the cards.

Make one change at a time, then refresh. Start with visual values before changing the API or login logic.
