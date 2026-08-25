import { MathNumberItem, ShapeColorItem } from '../types';

export const NUMBERS_DATA: MathNumberItem[] = [
  {
    number: 1,
    wordVi: 'Số Một',
    itemEmoji: '🍎',
    itemNameVi: '1 Quả Táo đỏ',
    color: 'from-red-400 to-rose-500',
    dots: 1,
  },
  {
    number: 2,
    wordVi: 'Số Hai',
    itemEmoji: '🐱',
    itemNameVi: '2 Chú Mèo con',
    color: 'from-amber-400 to-orange-500',
    dots: 2,
  },
  {
    number: 3,
    wordVi: 'Số Ba',
    itemEmoji: '🚗',
    itemNameVi: '3 Chiếc Xe ô tô',
    color: 'from-yellow-400 to-amber-500',
    dots: 3,
  },
  {
    number: 4,
    wordVi: 'Số Bốn',
    itemEmoji: '⭐',
    itemNameVi: '4 Ngôi Sao vàng',
    color: 'from-emerald-400 to-green-600',
    dots: 4,
  },
  {
    number: 5,
    wordVi: 'Số Năm',
    itemEmoji: '🎈',
    itemNameVi: '5 Quả Bóng bay',
    color: 'from-sky-400 to-blue-500',
    dots: 5,
  },
  {
    number: 6,
    wordVi: 'Số Sáu',
    itemEmoji: '🌸',
    itemNameVi: '6 Bông Hoa thắm',
    color: 'from-indigo-400 to-purple-500',
    dots: 6,
  },
  {
    number: 7,
    wordVi: 'Số Bảy',
    itemEmoji: '🐥',
    itemNameVi: '7 Chú Vịt con',
    color: 'from-pink-400 to-rose-500',
    dots: 7,
  },
  {
    number: 8,
    wordVi: 'Số Tám',
    itemEmoji: '🍓',
    itemNameVi: '8 Quả Dâu tây',
    color: 'from-red-500 to-rose-600',
    dots: 8,
  },
  {
    number: 9,
    wordVi: 'Số Chín',
    itemEmoji: '🐟',
    itemNameVi: '9 Chú Cá bơi',
    color: 'from-cyan-400 to-teal-500',
    dots: 9,
  },
  {
    number: 10,
    wordVi: 'Số Mười',
    itemEmoji: '🚀',
    itemNameVi: '10 Tàu Vũ trụ',
    color: 'from-violet-500 to-purple-600',
    dots: 10,
  },
];

export const SHAPES_DATA: ShapeColorItem[] = [
  { id: 'circle', nameVi: 'Hình Tròn', type: 'shape', shapeType: 'circle', emoji: '🔴' },
  { id: 'square', nameVi: 'Hình Vuông', type: 'shape', shapeType: 'square', emoji: '🟦' },
  { id: 'triangle', nameVi: 'Hình Tam Giác', type: 'shape', shapeType: 'triangle', emoji: '🔺' },
  { id: 'star', nameVi: 'Hình Ngôi Sao', type: 'shape', shapeType: 'star', emoji: '⭐' },
  { id: 'heart', nameVi: 'Hình Trái Tim', type: 'shape', shapeType: 'heart', emoji: '💖' },
  { id: 'diamond', nameVi: 'Hình Thoi (Kim Cương)', type: 'shape', shapeType: 'diamond', emoji: '🔷' },
];

export const COLORS_DATA: ShapeColorItem[] = [
  { id: 'red', nameVi: 'Màu Đỏ', type: 'color', hex: '#EF4444', emoji: '🔴' },
  { id: 'yellow', nameVi: 'Màu Vàng', type: 'color', hex: '#EAB308', emoji: '🟡' },
  { id: 'blue', nameVi: 'Màu Xanh Dương', type: 'color', hex: '#3B82F6', emoji: '🔵' },
  { id: 'green', nameVi: 'Màu Xanh Lá Cây', type: 'color', hex: '#22C55E', emoji: '🟢' },
  { id: 'orange', nameVi: 'Màu Cam', type: 'color', hex: '#F97316', emoji: '🟠' },
  { id: 'purple', nameVi: 'Màu Tím', type: 'color', hex: '#A855F7', emoji: '🟣' },
  { id: 'pink', nameVi: 'Màu Hồng', type: 'color', hex: '#EC4899', emoji: '🌸' },
];
