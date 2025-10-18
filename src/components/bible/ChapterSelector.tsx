import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BibleBook } from "@/data/bibleBooks";

interface ChapterSelectorProps {
  book: BibleBook;
  selectedChapter: number;
  onSelectChapter: (chapter: number) => void;
}

export const ChapterSelector = ({
  book,
  selectedChapter,
  onSelectChapter,
}: ChapterSelectorProps) => {
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {book.name}
        </h3>
        <span className="text-sm text-muted-foreground">
          {book.chapters} chapters
        </span>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {chapters.map((chapter) => (
            <Button
              key={chapter}
              variant={selectedChapter === chapter ? "default" : "outline"}
              className="h-12 w-full"
              onClick={() => onSelectChapter(chapter)}
            >
              {chapter}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
