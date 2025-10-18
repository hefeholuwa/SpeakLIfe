import { useState } from "react";
import { ChevronLeft, ChevronRight, BookMarked, Share2, Volume2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BibleBook } from "@/data/bibleBooks";
import { Slider } from "@/components/ui/slider";

interface ChapterViewerProps {
  book: BibleBook;
  chapter: number;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

// Sample verse data - in production, this would come from a Bible API
const getSampleVerses = (book: BibleBook, chapter: number) => {
  // This is mock data - you'll replace with actual Bible API calls
  if (book.name === "John" && chapter === 3) {
    return [
      { number: 1, text: "Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council." },
      { number: 2, text: "He came to Jesus at night and said, 'Rabbi, we know that you are a teacher who has come from God. For no one could perform the signs you are doing if God were not with him.'" },
      { number: 3, text: "Jesus replied, 'Very truly I tell you, no one can see the kingdom of God unless they are born again.'" },
      { number: 16, text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
      { number: 17, text: "For God did not send his Son into the world to condemn the world, but to save the world through him." },
    ];
  }
  
  // Default sample verses for any chapter
  return [
    { number: 1, text: "This is sample verse text from the Bible API. In production, these verses will be loaded from a real Bible database." },
    { number: 2, text: "Each verse will display the actual Scripture text from the selected book and chapter." },
    { number: 3, text: "You can integrate with APIs like Bible API, ESV API, or use a local Bible database." },
  ];
};

export const ChapterViewer = ({
  book,
  chapter,
  onPreviousChapter,
  onNextChapter,
  canGoPrevious,
  canGoNext,
}: ChapterViewerProps) => {
  const [fontSize, setFontSize] = useState([16]);
  const verses = getSampleVerses(book, chapter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-peace-gradient border-primary/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {book.name} {chapter}
            </h2>
            <p className="text-sm text-muted-foreground">{verses.length} verses</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" title="Text to Speech">
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" title="Bookmark">
              <BookMarked className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" title="Share">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Font Size Control */}
        <div className="flex items-center gap-4">
          <Type className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={fontSize}
            onValueChange={setFontSize}
            min={12}
            max={24}
            step={1}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-12">{fontSize[0]}px</span>
        </div>
      </Card>

      {/* Verses */}
      <Card className="p-6 shadow-soft border-primary/10">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {verses.map((verse) => (
              <div
                key={verse.number}
                className="group flex gap-4 hover:bg-accent/30 p-3 rounded-lg transition-colors cursor-pointer"
                style={{ fontSize: `${fontSize[0]}px` }}
              >
                <span className="flex-shrink-0 font-bold text-primary w-8">
                  {verse.number}
                </span>
                <p className="text-foreground leading-relaxed">{verse.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onPreviousChapter}
          disabled={!canGoPrevious}
          className="flex-1 gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Chapter
        </Button>
        
        <Button
          variant="outline"
          onClick={onNextChapter}
          disabled={!canGoNext}
          className="flex-1 gap-2"
        >
          Next Chapter
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        💡 Tip: Connect to Bible API for full Scripture text
      </p>
    </div>
  );
};
