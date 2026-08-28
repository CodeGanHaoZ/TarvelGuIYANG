'use client';
import { createContext, useContext } from 'react';
import * as L from 'lucide-react';
export const IconContext = createContext('line');
function icon(Component: L.LucideIcon, emoji: string) {
  return function TravelIcon(props: L.LucideProps) {
    const set = useContext(IconContext);
    return set === 'emoji' ? (
      <span
        className={'emoji-icon ' + (props.className || '')}
        aria-hidden="true"
        style={{
          fontSize: props.size ? Number(props.size) : 20,
          ...props.style,
        }}
      >
        {emoji}
      </span>
    ) : (
      <Component
        {...props}
        aria-hidden="true"
        strokeWidth={set === 'solid' ? 2.8 : 1.7}
      />
    );
  };
}
export const Mountain = icon(L.Mountain, '⛰️'),
  Compass = icon(L.Compass, '🧭'),
  Map = icon(L.Map, '🗺️'),
  Heart = icon(L.Heart, '💛'),
  UserRound = icon(L.UserRound, '👤'),
  Sparkles = icon(L.Sparkles, '✨'),
  ArrowUpRight = icon(L.ArrowUpRight, '↗'),
  ArrowRight = icon(L.ArrowRight, '→'),
  ArrowLeft = icon(L.ArrowLeft, '←'),
  Link2 = icon(L.Link2, '🔗'),
  Play = icon(L.Play, '▶'),
  MapPin = icon(L.MapPin, '📍'),
  CloudSun = icon(L.CloudSun, '🌤️'),
  Plus = icon(L.Plus, '＋'),
  Check = icon(L.Check, '✓'),
  ChevronRight = icon(L.ChevronRight, '›'),
  ChevronDown = icon(L.ChevronDown, '⌄'),
  ChevronUp = icon(L.ChevronUp, '⌃'),
  Search = icon(L.Search, '🔍'),
  CalendarDays = icon(L.CalendarDays, '📅'),
  Users = icon(L.Users, '👥'),
  Wallet = icon(L.Wallet, '💰'),
  Clock = icon(L.Clock, '🕒'),
  Route = icon(L.Route, '🛤️'),
  Share2 = icon(L.Share2, '↗'),
  Download = icon(L.Download, '📥'),
  CloudRain = icon(L.CloudRain, '🌧️'),
  GripVertical = icon(L.GripVertical, '⠿'),
  Trash2 = icon(L.Trash2, '🗑️'),
  X = icon(L.X, '×'),
  Star = icon(L.Star, '⭐'),
  Bookmark = icon(L.Bookmark, '🔖'),
  Copy = icon(L.Copy, '📋'),
  Send = icon(L.Send, '➤'),
  Settings2 = icon(L.Settings2, '⚙️'),
  WifiOff = icon(L.WifiOff, '📡'),
  CheckCircle2 = icon(L.CheckCircle2, '✅'),
  Circle = icon(L.Circle, '○'),
  LoaderCircle = icon(L.LoaderCircle, '◌'),
  Info = icon(L.Info, 'ⓘ'),
  ArrowDown = icon(L.ArrowDown, '↓'),
  ArrowUp = icon(L.ArrowUp, '↑'),
  Undo2 = icon(L.Undo2, '↶'),
  Utensils = icon(L.Utensils, '🍜'),
  TreePine = icon(L.TreePine, '🌲'),
  Footprints = icon(L.Footprints, '🥾'),
  Landmark = icon(L.Landmark, '🏛️'),
  Flag = icon(L.Flag, '🚩'),
  BedDouble = icon(L.BedDouble, '🛏️'),
  TrainFront = icon(L.TrainFront, '🚆'),
  Ticket = icon(L.Ticket, '🎫'),
  Minus = icon(L.Minus, '−'),
  LocateFixed = icon(L.LocateFixed, '⌖'),
  Layers = icon(L.Layers, '▱'),
  NotebookPen = icon(L.NotebookPen, '📝');
