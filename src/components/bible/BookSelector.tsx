import { Book, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bibleBooks, BibleBook } from "@/data/bibleBooks";
import { useState } from "react";

interface BookSelectorProps {
  onSelectBook: (book: BibleBook) => void;
  selectedBook?: BibleBook;
}

export const BookSelector = ({ onSelectBook, selectedBook }: BookSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const oldTestament = bibleBooks.filter((book) => book.testament === "Old");
  const newTestament = bibleBooks.filter((book) => book.testament === "New");

  const filterBooks = (books: BibleBook[]) => {
    if (!searchQuery) return books;
    return books.filter((book) =>
      book.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const BookList = ({ books }: { books: BibleBook[] }) => (
    <ScrollArea className="h-[500px] pr-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {books.map((book) => (
          <Button
            key={book.name}
            variant={selectedBook?.name === book.name ? "default" : "outline"}
            className="justify-start h-auto py-3 px-4"
            onClick={() => onSelectBook(book)}
          >
            <div className="flex items-center gap-3 w-full">
              <Book className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="font-medium">{book.name}</p>
                <p className="text-xs opacity-70">{book.chapters} chapters</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search books..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Books</TabsTrigger>
          <TabsTrigger value="old">Old Testament</TabsTrigger>
          <TabsTrigger value="new">New Testament</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <BookList books={filterBooks(bibleBooks)} />
        </TabsContent>

        <TabsContent value="old" className="mt-4">
          <BookList books={filterBooks(oldTestament)} />
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <BookList books={filterBooks(newTestament)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
