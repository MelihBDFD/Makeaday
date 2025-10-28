import { useState, useEffect, useRef } from 'react'
import { Plus, Check, Trash2, Clock, Calendar, Moon, Sun, MessageSquare, X, Search, Star, Download, Upload, Trophy, Target, TrendingUp, Palette, Settings, Filter, Zap, Bell, Volume2, VolumeX, Eye, EyeOff, Sparkles, Mic, MicOff, Grid3X3, List, MoreVertical, Edit3, Copy, Archive } from 'lucide-react'

type Task = {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  time?: string
  category?: string
  priority?: number // 1-5 yıldız
}

type Feedback = {
  rating: number
  comment: string
  createdAt: Date
}

type TaskTemplate = {
  id: string
  name: string
  tasks: Omit<Task, 'id' | 'createdAt' | 'completed'>[]
}

type Theme = {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
}

type Toast = {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const categories = ['İş', 'Okul', 'Kişisel', 'Spor', 'Sağlık']

const themes: Theme[] = [
  { id: 'blue', name: 'Mavi', primary: '#3b82f6', secondary: '#64748b', accent: '#f59e0b', background: 'from-blue-50 to-indigo-100' },
  { id: 'green', name: 'Yeşil', primary: '#10b981', secondary: '#6b7280', accent: '#f59e0b', background: 'from-green-50 to-emerald-100' },
  { id: 'purple', name: 'Mor', primary: '#8b5cf6', secondary: '#64748b', accent: '#f59e0b', background: 'from-purple-50 to-violet-100' },
  { id: 'red', name: 'Kırmızı', primary: '#ef4444', secondary: '#64748b', accent: '#fbbf24', background: 'from-red-50 to-rose-100' },
  { id: 'orange', name: 'Turuncu', primary: '#f97316', secondary: '#64748b', accent: '#3b82f6', background: 'from-orange-50 to-amber-100' }
]

const taskTemplates: TaskTemplate[] = [
  {
    id: 'morning',
    name: 'Sabah Rutini',
    tasks: [
      { text: 'Uyandım', time: '07:00', category: 'Kişisel', priority: 3 },
      { text: 'Kahvaltı hazırla', time: '07:30', category: 'Kişisel', priority: 2 },
      { text: 'Egzersiz yap', time: '08:00', category: 'Spor', priority: 4 },
      { text: 'Duş al', time: '08:30', category: 'Kişisel', priority: 3 },
      { text: 'Gün planı yap', time: '09:00', category: 'İş', priority: 5 }
    ]
  },
  {
    id: 'work',
    name: 'İş Günü',
    tasks: [
      { text: 'E-posta kontrolü', time: '09:00', category: 'İş', priority: 4 },
      { text: 'Toplantı hazırlığı', time: '10:00', category: 'İş', priority: 5 },
      { text: 'Öğle yemeği', time: '12:30', category: 'Kişisel', priority: 3 },
      { text: 'Proje çalışması', time: '14:00', category: 'İş', priority: 5 },
      { text: 'Gün sonu değerlendirmesi', time: '17:00', category: 'İş', priority: 4 }
    ]
  },
  {
    id: 'study',
    name: 'Çalışma Günü',
    tasks: [
      { text: 'Matematik çalış', time: '09:00', category: 'Okul', priority: 5 },
      { text: 'Fizik ödevi', time: '11:00', category: 'Okul', priority: 4 },
      { text: 'Ara verme', time: '13:00', category: 'Kişisel', priority: 3 },
      { text: 'Türkçe ders çalış', time: '14:00', category: 'Okul', priority: 4 },
      { text: 'Tekrar et', time: '16:00', category: 'Okul', priority: 5 }
    ]
  }
]

const motivationalMessages = [
  "Harika gidiyorsun! ✨",
  "Bir adım daha yaklaştın hedefe! 🎯",
  "Sen yapabilirsin! 💪",
  "Her görev seni daha güçlü yapıyor! ⚡",
  "Bugün mükemmel bir gün! 🌟",
  "Devam et, başarı yakında! 🚀",
  "Sen bir yıldızsın! ⭐",
  "Mükemmel iş çıkarıyorsun! 👏"
]

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [taskTime, setTaskTime] = useState('')
  const [taskCategory, setTaskCategory] = useState('')
  const [taskPriority, setTaskPriority] = useState(3)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0])
  const [darkMode, setDarkMode] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showThemes, setShowThemes] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [streak, setStreak] = useState(0)
  const [motivationalMessage, setMotivationalMessage] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [showContextMenu, setShowContextMenu] = useState<{ x: number; y: number; taskId: string } | null>(null)

  const taskInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // İlk giriş kontrolü ve veri yükleme
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('focusflow-visited')
    const savedDarkMode = localStorage.getItem('focusflow-darkmode') === 'true'
    const savedTheme = localStorage.getItem('focusflow-theme')
    const savedFeedbacks = localStorage.getItem('focusflow-feedbacks')
    const savedStreak = localStorage.getItem('focusflow-streak')
    const savedSoundEnabled = localStorage.getItem('focusflow-sound') !== 'false'
    const savedViewMode = localStorage.getItem('focusflow-viewmode') as 'list' | 'grid' || 'list'

    if (isFirstVisit) {
      setShowWelcome(true)
      localStorage.setItem('focusflow-visited', 'true')
    }

    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add('dark')
    }

    if (savedTheme) {
      const theme = themes.find(t => t.id === savedTheme)
      if (theme) setCurrentTheme(theme)
    }

    if (savedFeedbacks) {
      setFeedbacks(JSON.parse(savedFeedbacks).map((f: any) => ({
        ...f,
        createdAt: new Date(f.createdAt)
      })))
    }

    if (savedStreak) {
      setStreak(parseInt(savedStreak))
    }

    setSoundEnabled(savedSoundEnabled)
    setViewMode(savedViewMode)

    const savedTasks = localStorage.getItem('focusflow-tasks')
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }))
        setTasks(parsedTasks)
      } catch (error) {
        console.error('Görev yükleme hatası:', error)
        // Hata durumunda boş array kullan
        setTasks([])
      }
    }

    // Rastgele motivasyon mesajı
    setMotivationalMessage(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)])
  }, [])

  // Klavye kısayolları
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: Yeni görev ekle
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && newTask.trim()) {
        e.preventDefault()
        addTask(e as any)
      }
      // Ctrl/Cmd + K: Arama kutusuna odaklan
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // Escape: Tüm modal'ları kapat
      if (e.key === 'Escape') {
        setShowWelcome(false)
        setShowFeedback(false)
        setShowTemplates(false)
        setShowThemes(false)
        setShowStats(false)
        setShowSettings(false)
        setShowContextMenu(null)
      }
      // Ctrl/Cmd + /: Ayarlar modal'ı aç
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setShowSettings(true)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [newTask])

  // Toast notification sistemi
  const addToast = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const toast: Toast = {
      id: Date.now().toString(),
      message,
      type,
      duration
    }
    setToasts(prev => [...prev, toast])

    // Otomatik kaldır
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, duration)
  }

  // Ses efekti çalma
  const playSound = (type: 'success' | 'error' | 'complete' | 'notification') => {
    if (!soundEnabled) return

    // Basit ses efekti (web audio API ile)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const frequencies = {
        success: 800,
        error: 300,
        complete: 600,
        notification: 500
      }

      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      // Ses desteklenmiyorsa sessizce devam et
    }
  }

  // Dark mode değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('focusflow-darkmode', darkMode.toString())
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Tema değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('focusflow-theme', currentTheme.id)
  }, [currentTheme])

  // View mode değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('focusflow-viewmode', viewMode)
  }, [viewMode])

  // Sound setting değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('focusflow-sound', soundEnabled.toString())
  }, [soundEnabled])

  // Streak hesapla
  useEffect(() => {
    const today = new Date().toDateString()
    const lastCompletedDate = localStorage.getItem('focusflow-last-completed')

    if (tasks.some(task => task.completed)) {
      if (lastCompletedDate !== today) {
        setStreak(prev => prev + 1)
        localStorage.setItem('focusflow-last-completed', today)
        localStorage.setItem('focusflow-streak', (streak + 1).toString())
        addToast('🎉 Yeni bir başarı günü!', 'success')
        playSound('success')
      }
    }
  }, [tasks])

  // Görevler değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('focusflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  // Feedbackler değiştiğinde kaydet
  useEffect(() => {
    localStorage.setItem('focusflow-feedbacks', JSON.stringify(feedbacks))
  }, [feedbacks])

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      createdAt: new Date(),
      time: taskTime,
      category: taskCategory,
      priority: taskPriority
    }

    setTasks([...tasks, task])
    setNewTask('')
    setTaskTime('')
    setTaskCategory('')
    setTaskPriority(3)

    addToast('✅ Görev başarıyla eklendi!', 'success')
    playSound('notification')

    // Input'a odaklan
    taskInputRef.current?.focus()
  }

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const newTasks = tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    )
    setTasks(newTasks)

    if (!task.completed) {
      addToast('🎯 Görev tamamlandı!', 'success')
      playSound('complete')
    }
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
    addToast('🗑️ Görev silindi', 'info')
    playSound('notification')
  }

  const startEditTask = (id: string, currentText: string) => {
    setEditingTask(id)
    setEditText(currentText)
  }

  const saveEditTask = () => {
    if (!editText.trim() || !editingTask) return

    setTasks(tasks.map(task =>
      task.id === editingTask ? { ...task, text: editText } : task
    ))
    setEditingTask(null)
    setEditText('')
    addToast('✏️ Görev güncellendi!', 'success')
  }

  const cancelEditTask = () => {
    setEditingTask(null)
    setEditText('')
  }

  const duplicateTask = (id: string) => {
    const taskToDuplicate = tasks.find(task => task.id === id)
    if (!taskToDuplicate) return

    const duplicatedTask: Task = {
      ...taskToDuplicate,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      completed: false // Reset completion status for duplicated task
    }

    setTasks([...tasks, duplicatedTask])
    addToast('📋 Görev kopyalandı!', 'success')
    playSound('notification')
  }

  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault()
    setShowContextMenu({ x: e.clientX, y: e.clientY, taskId })
  }

  const closeContextMenu = () => {
    setShowContextMenu(null)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    addToast(`${darkMode ? '☀️ Açık' : '🌙 Koyu'} moda geçildi`, 'info')
  }

  const changeTheme = (theme: Theme) => {
    setCurrentTheme(theme)
    setShowThemes(false)
  }

  const applyTemplate = (template: TaskTemplate) => {
    const newTasks = template.tasks.map(task => ({
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      completed: false
    }))
    setTasks([...tasks, ...newTasks])
    setShowTemplates(false)
  }

  const exportData = () => {
    const data = {
      tasks,
      feedbacks,
      streak,
      theme: currentTheme.id,
      darkMode,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.tasks) {
            const parsedTasks = data.tasks.map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt)
            }))
            setTasks(parsedTasks)
          }
          if (data.feedbacks) {
            const parsedFeedbacks = data.feedbacks.map((f: any) => ({
              ...f,
              createdAt: new Date(f.createdAt)
            }))
            setFeedbacks(parsedFeedbacks)
          }
          if (data.streak) setStreak(data.streak)
          if (data.theme) {
            const theme = themes.find(t => t.id === data.theme)
            if (theme) setCurrentTheme(theme)
          }
          if (data.darkMode !== undefined) setDarkMode(data.darkMode)
          alert('Veriler başarıyla içe aktarıldı!')
        } catch (error) {
          alert('Geçersiz dosya formatı!')
        }
      }
      reader.readAsText(file)
    }
  }

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (feedbackRating === 0) return

    const feedback: Feedback = {
      rating: feedbackRating,
      comment: feedbackComment,
      createdAt: new Date()
    }

    setFeedbacks([...feedbacks, feedback])
    setFeedbackRating(0)
    setFeedbackComment('')
    setShowFeedback(false)
  }

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'active') return !task.completed
    if (activeTab === 'completed') return task.completed
    if (selectedCategory && task.category !== selectedCategory) return false
    if (searchTerm && !task.text.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (dateFilter) {
      const taskDate = task.createdAt.toISOString().split('T')[0]
      if (dateFilter === 'today') {
        return taskDate === new Date().toISOString().split('T')[0]
      } else if (dateFilter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return new Date(task.createdAt) >= weekAgo
      } else if (dateFilter === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return new Date(task.createdAt) >= monthAgo
      }
    }
    return true
  })

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(task => task.completed).length
    const active = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const categoryStats = categories.map(cat => ({
      name: cat,
      count: tasks.filter(t => t.category === cat).length,
      completed: tasks.filter(t => t.category === cat && t.completed).length
    }))
    return { total, completed, active, completionRate, categoryStats }
  }

  const stats = getTaskStats()

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900 text-white' : `bg-gradient-to-br ${currentTheme.background}`}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full animate-slide-in ${
                toast.type === 'success' ? 'bg-green-500 text-white' :
                toast.type === 'error' ? 'bg-red-500 text-white' :
                toast.type === 'warning' ? 'bg-yellow-500 text-black' :
                'bg-blue-500 text-white'
              }`}
              style={{
                animation: 'slideIn 0.3s ease-out forwards'
              }}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' && '✅'}
                {toast.type === 'error' && '❌'}
                {toast.type === 'warning' && '⚠️'}
                {toast.type === 'info' && 'ℹ️'}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Context Menu */}
        {showContextMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          >
            <div
              className={`absolute bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 min-w-48 border ${
                darkMode ? 'border-gray-600' : 'border-gray-200'
              }`}
              style={{
                left: showContextMenu.x,
                top: showContextMenu.y,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <button
                onClick={() => startEditTask(showContextMenu.taskId, tasks.find(t => t.id === showContextMenu.taskId)?.text || '')}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit3 size={16} />
                Düzenle
              </button>
              <button
                onClick={() => duplicateTask(showContextMenu.taskId)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy size={16} />
                Kopyala
              </button>
              <button
                onClick={() => deleteTask(showContextMenu.taskId)}
                className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Sil
              </button>
            </div>
          </div>
        )}

        {/* Welcome Modal */}
        {showWelcome && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`p-6 md:p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} relative`}>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">!</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">🎉 Hoş Geldiniz!</h2>
              <div className="space-y-3 text-sm md:text-base mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <Zap className="text-blue-500 flex-shrink-0" size={20} />
                  <span><strong>Ctrl+Enter:</strong> Hızlı görev ekleme</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <Search className="text-green-500 flex-shrink-0" size={20} />
                  <span><strong>Ctrl+K:</strong> Arama kutusuna odaklan</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <Settings className="text-purple-500 flex-shrink-0" size={20} />
                  <span><strong>Ctrl+/:</strong> Ayarlar menüsü</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                  <Star className="text-orange-500 flex-shrink-0" size={20} />
                  <span><strong>Sağ tık:</strong> Görev menüsü</span>
                </div>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium text-base"
              >
                🚀 Başlayalım!
              </button>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-xl max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">⚙️ Ayarlar</h2>
                <button onClick={() => setShowSettings(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Volume2 size={20} />
                    Ses Efektleri
                  </span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                    } relative`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye size={20} />
                    Görünüm Modu
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      <List size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                      <Grid3X3 size={16} />
                    </button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <button
                    onClick={() => {
                      localStorage.clear()
                      setTasks([])
                      setFeedbacks([])
                      setStreak(0)
                      setShowSettings(false)
                      addToast('🗑️ Tüm veriler temizlendi!', 'warning')
                    }}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Tüm Verileri Temizle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-xl max-w-md w-full mx-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">💬 Geri Bildirim</h2>
                <button onClick={() => setShowFeedback(false)}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={submitFeedback} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Puanınız (1-5 yıldız):</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className={`text-2xl transition-all duration-200 hover:scale-110 ${
                          star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Yorumunuz (İsteğe bağlı):</label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Uygulama hakkında düşünceleriniz..."
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                    }`}
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFeedback(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackRating === 0}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Gönder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🎯 Görev Şablonları</h2>
                <button onClick={() => setShowTemplates(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taskTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all ${
                      darkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => applyTemplate(template)}
                  >
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.tasks.length} görev içerir
                    </p>
                    <div className="space-y-1">
                      {template.tasks.slice(0, 3).map((task, index) => (
                        <div key={index} className="text-sm flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="truncate">{task.text}</span>
                        </div>
                      ))}
                      {template.tasks.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{template.tasks.length - 3} daha fazla görev...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowTemplates(false)}
                  className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Themes Modal */}
        {showThemes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-xl max-w-2xl w-full mx-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🎨 Tema Seçenekleri</h2>
                <button onClick={() => setShowThemes(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                      currentTheme.id === theme.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : darkMode
                        ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => changeTheme(theme)}
                  >
                    <div
                      className={`w-full h-16 rounded-lg mb-3 bg-gradient-to-br ${theme.background}`}
                    ></div>
                    <h3 className="font-semibold mb-1">{theme.name}</h3>
                    <div className="flex gap-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.primary }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.secondary }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.accent }}
                      ></div>
                    </div>
                    {currentTheme.id === theme.id && (
                      <div className="mt-2 text-sm text-blue-500 font-medium">✓ Aktif</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowThemes(false)}
                  className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Modal */}
        {showStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-8 rounded-lg shadow-xl max-w-4xl w-full mx-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">📊 Detaylı İstatistikler</h2>
                <button onClick={() => setShowStats(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Genel İstatistikler</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span>Toplam Görev:</span>
                      <span className="font-semibold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span>Aktif Görev:</span>
                      <span className="font-semibold text-green-600">{stats.active}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span>Tamamlanan:</span>
                      <span className="font-semibold text-purple-600">{stats.completed}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span>Başarı Oranı:</span>
                      <span className="font-semibold text-orange-600">{stats.completionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span>Başarı Serisi:</span>
                      <span className="font-semibold text-blue-600">{streak} gün</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Kategori Dağılımı</h3>
                  <div className="space-y-3">
                    {stats.categoryStats.map((cat) => (
                      <div key={cat.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{cat.name}</span>
                          <span>{cat.count} görev ({cat.completed} tamamlandı)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: cat.count > 0 ? `${(cat.completed / cat.count) * 100}%` : '0%' }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {feedbacks.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Geri Bildirim İstatistikleri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-500">
                        {(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Ortalama Puan</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-500">{feedbacks.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Geri Bildirim</div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {feedbacks.filter(f => f.rating >= 4).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Olumlu Geri Bildirim</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowStats(false)}
                  className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4 md:gap-0">
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🌟 FocusFlow Pro
            </h1>
            <p className={`text-base md:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Akıllı Görev Yönetimi & Üretkenlik Sistemi
            </p>
            {streak > 0 && (
              <div className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 md:px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <TrendingUp size={14} />
                🔥 {streak} günlük başarı serisi!
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            <button
              onClick={() => setShowStats(true)}
              className={`p-2 md:p-3 rounded-lg transition-all duration-200 hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 shadow-md'}`}
              title="Detaylı İstatistikler"
            >
              <TrendingUp size={18} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className={`p-2 md:p-3 rounded-lg transition-all duration-200 hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 shadow-md'}`}
              title="Görev Şablonları"
            >
              <Target size={18} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => setShowThemes(true)}
              className={`p-2 md:p-3 rounded-lg transition-all duration-200 hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 shadow-md'}`}
              title="Tema Seçenekleri"
            >
              <Palette size={18} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 md:p-3 rounded-lg transition-all duration-200 hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 shadow-md'}`}
              title="Koyu/Açık Mod"
            >
              {darkMode ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              className={`p-2 md:p-3 rounded-lg transition-all duration-200 hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 shadow-md'}`}
              title="Geri Bildirim"
            >
              <MessageSquare size={18} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 md:p-3 rounded-lg transition-all duration-200 hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 shadow-md'}`}
              title="Ayarlar"
            >
              <Settings size={18} className="md:w-5 md:h-5" />
            </button>
            <div className="flex gap-2 ml-2 border-l border-gray-300 dark:border-gray-600 pl-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 md:p-3 rounded-lg transition-all duration-200 hover:scale-105 ${viewMode === 'list' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 shadow-md')}`}
                title="Liste Görünümü"
              >
                <List size={18} className="md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 md:p-3 rounded-lg transition-all duration-200 hover:scale-105 ${viewMode === 'grid' ? (darkMode ? 'bg-gray-600' : 'bg-gray-200') : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100 shadow-md')}`}
                title="Izgara Görünümü"
              >
                <Grid3X3 size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className={`mb-6 p-6 rounded-xl text-center shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          <div className="relative">
            <Sparkles className="mx-auto mb-2 text-yellow-500" size={24} />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{motivationalMessage}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className={`p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-2xl md:text-3xl font-bold mb-2" style={{ color: currentTheme.primary }}>{stats.total}</div>
            <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Toplam Görev</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
            </div>
          </div>
          <div className={`p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-2xl md:text-3xl font-bold mb-2 text-green-400">{stats.active}</div>
            <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Aktif Görev</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: stats.total > 0 ? `${(stats.active / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>
          <div className={`p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-2xl md:text-3xl font-bold mb-2 text-purple-400">{stats.completed}</div>
            <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tamamlanan</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: stats.total > 0 ? `${(stats.completed / stats.total) * 100}%` : '0%' }}></div>
            </div>
          </div>
          <div className={`p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-2xl md:text-3xl font-bold mb-2 text-orange-400">{stats.completionRate}%</div>
            <div className={`text-xs md:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Başarı Oranı</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.completionRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`p-4 md:p-6 rounded-xl shadow-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-3 flex-1 w-full">
              <div className="relative flex-1">
                <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Görev ara... (Ctrl+K)"
                  className={`pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                }`}
              >
                <option value="">📅 Tüm Tarihler</option>
                <option value="today">📅 Bugün</option>
                <option value="week">📊 Bu Hafta</option>
                <option value="month">🗓️ Bu Ay</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 md:px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 shadow-md text-sm md:text-base"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Dışa Aktar</span>
                </button>
                <label className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 md:px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer text-sm md:text-base">
                  <Upload size={16} />
                  <span className="hidden sm:inline">İçe Aktar</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Add Task Form */}
        <div className={`p-4 md:p-8 rounded-xl shadow-lg mb-6 md:mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <div className="relative">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 flex items-center gap-2">
              <Plus className="text-blue-500" size={20} />
              Yeni Görev Ekle
            </h2>
            <form onSubmit={addTask} className="space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row gap-3 flex-wrap">
                <input
                  ref={taskInputRef}
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Görev açıklaması... (Ctrl+Enter ile ekle)"
                  className={`flex-1 p-3 md:p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base md:text-lg ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 shadow-sm'
                  }`}
                  required
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className={`p-3 md:p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 shadow-sm'
                    }`}
                  />
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className={`p-3 md:p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-32 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 shadow-sm'
                    }`}
                  >
                    <option value="">📂 Kategori Seç</option>
                    {categories.map(category => (
                      <option key={category} value={category}>📂 {category}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-sm font-medium whitespace-nowrap">⭐ Öncelik:</span>
                  {[1, 2, 3, 4, 5].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setTaskPriority(priority)}
                      className={`text-lg md:text-xl transition-all duration-200 hover:scale-110 ${
                        priority <= taskPriority ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 md:p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-md flex items-center justify-center gap-2 font-medium w-full md:w-auto"
                >
                  <Plus size={20} />
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3 md:space-y-4">
          {filteredTasks.length === 0 ? (
            <div className={`p-6 md:p-8 rounded-xl shadow-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Calendar size={40} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Görev bulunamadı</p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-400'}>
                Yeni görev eklemek için yukarıdaki formu kullanın
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3 md:space-y-4'}>
              {filteredTasks
                .sort((a, b) => (b.priority || 3) - (a.priority || 3)) // Öncelik sırasına göre sırala
                .map(task => (
                  <div
                    key={task.id}
                    className={`${
                      viewMode === 'grid'
                        ? 'p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
                        : 'flex items-center p-4 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'
                    } ${darkMode ? 'bg-gray-800' : 'bg-white'} ${task.completed ? 'opacity-75' : ''} ${
                      editingTask === task.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onContextMenu={(e) => handleContextMenu(e, task.id)}
                  >
                    {viewMode === 'grid' ? (
                      // Grid View
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 hover:scale-110 ${
                              task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-blue-500'
                            }`}
                          >
                            {task.completed && <Check size={16} />}
                          </button>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={`${
                                  star <= (task.priority || 3) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {editingTask === task.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className={`flex-1 p-2 border rounded ${
                                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                }`}
                                autoFocus
                              />
                              <button
                                onClick={saveEditTask}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelEditTask}
                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <p className={`text-base md:text-lg font-medium ${task.completed ? 'line-through text-gray-500' : darkMode ? 'text-white' : 'text-gray-800'}`}>
                              {task.text}
                            </p>
                          )}

                          <div className={`flex items-center gap-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {task.time && (
                              <div className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                {task.time}
                              </div>
                            )}
                            {task.category && (
                              <span className={`px-2 py-1 rounded text-xs ${
                                darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {task.category}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                          <div className="text-xs text-gray-500">
                            {new Date(task.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditTask(task.id, task.text)}
                              className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors"
                              title="Düzenle"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => duplicateTask(task.id)}
                              className="text-green-500 hover:text-green-700 p-2 rounded hover:bg-green-50 transition-colors"
                              title="Kopyala"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // List View
                      <>
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          {task.completed && <Check size={18} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          {editingTask === task.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className={`flex-1 p-2 border rounded ${
                                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                                }`}
                                autoFocus
                              />
                              <button
                                onClick={saveEditTask}
                                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelEditTask}
                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-base md:text-lg font-medium ${task.completed ? 'line-through text-gray-500' : darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {task.text}
                              </p>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    className={`${
                                      star <= (task.priority || 3) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          <div className={`flex flex-wrap items-center gap-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {task.time && (
                              <div className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                {task.time}
                              </div>
                            )}
                            {task.category && (
                              <span className={`px-2 py-1 rounded text-xs ${
                                darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {task.category}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(task.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => startEditTask(task.id, task.text)}
                            className="text-blue-500 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors"
                            title="Düzenle"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => duplicateTask(task.id)}
                            className="text-green-500 hover:text-green-700 p-2 rounded hover:bg-green-50 transition-colors"
                            title="Kopyala"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Feedback Stats */}
        {feedbacks.length > 0 && (
          <div className={`mt-8 p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-semibold mb-2">📊 Geri Bildirim İstatistikleri</h3>
            <div className="flex items-center gap-4 text-sm">
              <span>Ortalama Puan: {feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 0} ⭐</span>
              <span>Toplam Geri Bildirim: {feedbacks.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
