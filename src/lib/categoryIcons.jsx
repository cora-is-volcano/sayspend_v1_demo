/**
 * Category icon mapping — category ID → Lucide icon element
 * All icons use consistent strokeWidth={1.75} and are sized by the caller.
 */
import {
    Utensils,
    ShoppingBag,
    Gift,
    BookOpen,
    ArrowLeftRight,
    Gamepad2,
    Home,
    Dumbbell,
    Car,
    Film,
    HeartPulse,
    TrendingUp,
    Package,
} from 'lucide-react';

const STROKE = 1.75;

export const CATEGORY_ICONS = {
    food:          (size = 18) => <Utensils        size={size} strokeWidth={STROKE} />,
    shopping:      (size = 18) => <ShoppingBag     size={size} strokeWidth={STROKE} />,
    gift:          (size = 18) => <Gift             size={size} strokeWidth={STROKE} />,
    education:     (size = 18) => <BookOpen         size={size} strokeWidth={STROKE} />,
    exchange:      (size = 18) => <ArrowLeftRight   size={size} strokeWidth={STROKE} />,
    gaming:        (size = 18) => <Gamepad2         size={size} strokeWidth={STROKE} />,
    essentials:    (size = 18) => <Home             size={size} strokeWidth={STROKE} />,
    sports:        (size = 18) => <Dumbbell         size={size} strokeWidth={STROKE} />,
    transport:     (size = 18) => <Car              size={size} strokeWidth={STROKE} />,
    entertainment: (size = 18) => <Film             size={size} strokeWidth={STROKE} />,
    health:        (size = 18) => <HeartPulse       size={size} strokeWidth={STROKE} />,
    income:        (size = 18) => <TrendingUp       size={size} strokeWidth={STROKE} />,
    others:        (size = 18) => <Package          size={size} strokeWidth={STROKE} />,
};

/** Returns a Lucide icon element for a category ID, with optional size override. */
export function getCategoryIcon(categoryId, size = 18) {
    const factory = CATEGORY_ICONS[categoryId] ?? CATEGORY_ICONS.others;
    return factory(size);
}
