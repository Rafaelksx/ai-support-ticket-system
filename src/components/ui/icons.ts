/**
 * Central SVG icon library using lucide-react.
 * Import from here to keep icon usage consistent across the app.
 *
 * Usage:
 *   import { Icons } from '@/components/ui/icons';
 *   <Icons.Ticket className="w-5 h-5" />
 */

export {
  // Navigation
  LayoutDashboard  as DashboardIcon,
  Ticket           as TicketIcon,
  PlusCircle       as NewTicketIcon,
  Bell             as NotificationIcon,
  Users            as UsersIcon,
  TrendingUp       as MetricsIcon,
  Settings         as SettingsIcon,
  LogOut           as LogoutIcon,
  Menu             as MenuIcon,
  X                as CloseIcon,
  ChevronRight     as ChevronRightIcon,

  // Status & Priority
  AlertCircle      as CriticalIcon,
  AlertTriangle    as HighPriorityIcon,
  Minus            as MediumPriorityIcon,
  ArrowDown        as LowPriorityIcon,
  CheckCircle2     as ResolvedIcon,
  Clock            as OpenIcon,
  Loader2          as InProgressIcon,
  XCircle          as ClosedIcon,

  // Metrics & KPIs
  Hash             as TotalIcon,
  LockOpen         as OpenTicketsIcon,
  Flame            as UrgentIcon,
  UserCheck        as AssignedIcon,
  BarChart3        as ChartIcon,
  Activity         as ActivityIcon,
  Target           as TargetIcon,

  // Actions & UI
  Pencil           as EditIcon,
  Trash2           as DeleteIcon,
  Eye              as ViewIcon,
  Search           as SearchIcon,
  Filter           as FilterIcon,
  RefreshCw        as RefreshIcon,
  Send             as SendIcon,
  Bot              as AIIcon,
  Sparkles         as SparklesIcon,
  Zap              as ZapIcon,
  Shield           as ShieldIcon,
  Star             as StarIcon,
  Copy             as CopyIcon,
  Check            as CheckIcon,
  Info             as InfoIcon,
  User             as UserIcon,
  Mail             as MailIcon,
  Tag              as TagIcon,
  Calendar         as CalendarIcon,
  ArrowLeft        as BackIcon,
} from 'lucide-react';
