import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { Button } from './ui/button'

const ReadingProgress = ({ onNavigate }) => {
  return (
    <Card className="p-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 border-0 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
            <span className="text-white text-3xl">📖</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Reading Journey</h2>
            <p className="text-white/80 text-sm">Continue your spiritual growth</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30">
          <span className="text-lg">📈</span>
          Stats
        </Button>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">Current Book: Psalms</span>
            <span className="text-white/90 font-bold">Chapter 23 of 150</span>
          </div>
          <div className="space-y-2">
            <Progress value={15.3} className="h-4 bg-white/20" />
            <p className="text-white/80 text-sm">15% complete • 127 chapters remaining</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/20">
          <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <p className="text-4xl font-black text-white mb-2">23</p>
            <p className="text-white/80 text-sm font-semibold">Books Read</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <p className="text-4xl font-black text-white mb-2">356</p>
            <p className="text-white/80 text-sm font-semibold">Chapters Complete</p>
          </div>
        </div>

        <Button 
          className="w-full bg-white text-purple-600 hover:bg-purple-50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 font-bold text-lg py-6" 
          size="lg" 
          onClick={() => onNavigate?.('bible')}
        >
          <span className="text-xl mr-2">🚀</span>
          Continue Reading
        </Button>
      </div>
    </Card>
  )
}

export default ReadingProgress