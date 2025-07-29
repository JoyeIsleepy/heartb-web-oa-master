"use client";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  ScrollShadow,
  Select,
  SelectItem,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/react";
import DeleteDocumentIcon from "./_components/DeleteDocumentIcon";
import CombineDocumentIcon from "./_components/CombineDocumentIcon";
import { cn } from "@nextui-org/theme";
import React, { useRef, useState } from "react";

export default function Home() {
  const iconClasses = "text-xl text-default-500 pointer-events-none shrink-0";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [chapters, setChapters] = useState<
    { title: string; content: string; id: string }[]
  >([]);
  const [historyStack, setHistoryStack] = useState<
    { title: string; content: string; id: string }[][]
  >([]);

  const [activeChapter, setActiveChapter] = useState<string>("");

  function fileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parsedChapters = parseChapters(content);
        setChapters(parsedChapters);
        setActiveChapter(parsedChapters.length > 0 ? parsedChapters[0].id : "");
      };
      reader.readAsText(file);
    }
  }

  function parseChapters(text: string) {
    const chapterRegex =
      /^\s*Chapter\s+(?:\d+|[IVXLCDM]+|[A-Za-z]+)(?::| -)?\s?.*$/gim;

    const matches = Array.from(text.matchAll(chapterRegex));

    if (matches.length === 0) {
      return [];
    }
    const result = [];
    for (let i = 0; i < matches.length; i++) {
      const title = matches[i][0].trim();
      const startIndex = matches[i].index || 0;
      const endIndex =
        i + 1 < matches.length ? matches[i + 1].index! : text.length;
      const content = text.slice(startIndex + title.length, endIndex).trim();
      const id = crypto.randomUUID();
      result.push({ title, content, id });
    }

    return result;
  }

  function actionChapter(key: string, id: string) {
    if (key === "delete") {
      setChapters((prev) => {
        const updated = prev.filter((chapter) => chapter.id !== id);
        if (activeChapter === id) {
          const nextChapter = updated[0];
          setActiveChapter(nextChapter?.id || "");
        }
        return updated;
      });
    }
    if (key === "combine") {
      setChapters((prev) => {
        const index = prev.findIndex((chapter) => chapter.id === id);
        if (index === -1 || index === prev.length - 1) {
          alert("No next chapter to combine with");
          return prev;
        }

        const current = prev[index];
        const next = prev[index + 1];

        const combinedChapter = {
          ...current,
          content: current.content + "\n\n" + next.content,
        };

        const updated = [
          ...prev.slice(0, index),
          combinedChapter,
          ...prev.slice(index + 2),
        ];

        return updated;
      });
    }
  }

  function insertSplitMarker() {
    const index = chapters.findIndex((c) => c.id === activeChapter);
    if (index === -1 || !textareaRef.current) return;
    // add to history
    pushToHistory();

    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const marker = "\n====SPLIT CHAPTER====\n";

    const content = chapters[index].content;
    const newContent =
      content.slice(0, selectionStart) + marker + content.slice(selectionEnd);

    const updatedChapters = [...chapters];
    updatedChapters[index].content = newContent;

    setChapters(updatedChapters);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd =
        selectionStart + marker.length;
    }, 0);
  }

  function splitChapter() {
    const index = chapters.findIndex((c) => c.id === activeChapter);
    if (index === -1) return;

    const chapter = chapters[index];
    const parts = chapter.content.split(/====SPLIT CHAPTER====/);

    if (parts.length <= 1) {
      alert("no split marker found");
      return;
    }
    // add to history
    pushToHistory();

    const newChapters = parts.map((part, i) => ({
      id: crypto.randomUUID(),
      title: `${chapter.title} - Part ${i + 1}`,
      content: part.trim(),
    }));

    const updated = [
      ...chapters.slice(0, index),
      ...newChapters,
      ...chapters.slice(index + 1),
    ];

    setChapters(updated);
    setActiveChapter(newChapters[0].id);
  }

  function pushToHistory() {
    setHistoryStack((prev) => [...prev, chapters]);
  }

  function handleUndo() {
    if (historyStack.length === 0) {
      alert("There is no operation that can be revoked");
      return;
    }

    const prev = [...historyStack];
    const last = prev.pop();
    if (!last) return;

    setHistoryStack(prev);
    setChapters(last);
    setActiveChapter(last[0]?.id ?? "");
  }
  return (
    <section className="flex flex-col items-center justify-center gap-4 pb-8 md:pb-10 border">
      <div className="w-full border-b">
        <Input
          type="file"
          label="import txt"
          className="cursor-pointer w-[200px]"
          onChange={fileUpload}
          accept=".txt"
        />
      </div>
      <div className="flex flex-row w-full px-4 h-[620px]">
        <div
          className={cn(
            "relative flex h-full w-72 max-w-[384px] flex-1 flex-col !border-r-small border-divider pr-3 transition-[transform,opacity,margin] duration-250 ease-in-out"
          )}
          id="menu"
        >
          <header className="flex items-center text-sm font-medium text-default-500 group-data-[selected=true]:text-foreground">
            <Icon
              className="text-default-500 mr-2"
              icon="solar:clipboard-text-outline"
              width={18}
            />
            Chapters
          </header>
          <ScrollShadow className="flex-1 -mr-4" id="menu-scroll">
            <div className="flex flex-col gap-4 py-3 pr-4">
              {chapters.map((chapter) => (
                <Card
                  key={chapter.id}
                  isPressable
                  className={`max-w-[384px] border-1 border-divider/15 ${
                    chapter.id === activeChapter ? "bg-themeBlue/20" : ""
                  }`}
                  shadow="none"
                  onPress={() => setActiveChapter(chapter.id)}
                >
                  <CardHeader className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-1">
                      {chapter.id === activeChapter && (
                        <Chip
                          className="mr-1 text-themeBlue bg-themeBlue/20"
                          radius="sm"
                          size="sm"
                          variant="flat"
                        >
                          Editing
                        </Chip>
                      )}
                      <p className="flex-1 text-left text-md mr-1 line-clamp-1">
                        {chapter.title}
                      </p>
                      <Dropdown>
                        <DropdownTrigger>
                          <div className="text-default-500  text-gray-500">
                            ···
                          </div>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Static Actions"
                          onAction={(key) =>
                            actionChapter(key as string, chapter.id)
                          }
                        >
                          <DropdownSection title="Action">
                            <DropdownItem
                              key="combine"
                              startContent={<CombineDocumentIcon />}
                              description="Combine this chapter with the next chapter"
                            >
                              Combine with next chapter
                            </DropdownItem>
                          </DropdownSection>
                          <DropdownSection title="Danger zone">
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              description="Permanently delete the file"
                              startContent={
                                <DeleteDocumentIcon
                                  className={cn(iconClasses, "text-danger")}
                                />
                              }
                            >
                              Delete this chapter
                            </DropdownItem>
                          </DropdownSection>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <p className="line-clamp-2">{chapter.content}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </ScrollShadow>
        </div>

        <div className="w-full flex-1 flex-col min-w-[600px] pl-4">
          <div className="flex flex-col h-full">
            <header className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <Button isIconOnly size="sm" variant="light">
                  <Icon
                    className="hideTooltip text-default-500"
                    height={18}
                    icon="solar:sidebar-minimalistic-outline"
                    width={18}
                  />
                </Button>
                <h4 className="text-md">
                  {chapters.length > 0 &&
                    chapters.find((chapter) => chapter.id === activeChapter)
                      ?.title}
                </h4>
              </div>
            </header>
            <div className="w-full flex-1 flex-col min-w-[400px]">
              <div className={cn("flex flex-col gap-4 h-full")}>
                <div className="flex flex-col items-start h-full">
                  <div className="relative w-full h-full bg-slate-50 dark:bg-gray-800 rounded-lg">
                    {chapters.length > 0 && (
                      <div className="absolute inset-x-4 top-4 z-10 flex justify-between items-center">
                        <div className="flex justify-between">
                          <Button
                            className="mr-2 bg-white dark:bg-gray-700"
                            size="sm"
                            startContent={
                              <Icon
                                className="text-default-500"
                                icon="mdi:content-cut"
                                width={24}
                              />
                            }
                            variant="flat"
                            onPress={insertSplitMarker}
                          >
                            Insert chapter split
                          </Button>
                          <Button
                            className="mr-2 bg-white dark:bg-gray-700"
                            size="sm"
                            startContent={
                              <Icon
                                className="text-default-500"
                                icon="material-symbols:undo"
                                width={24}
                              />
                            }
                            variant="flat"
                            onPress={handleUndo}
                          >
                            Undo
                          </Button>
                        </div>

                        <Button
                          className="mr-2 bg-white dark:bg-gray-700"
                          size="sm"
                          startContent={
                            <Icon
                              className="text-default-500"
                              icon="mdi:arrow-split-horizontal"
                              width={24}
                            />
                          }
                          variant="flat"
                          onPress={splitChapter}
                        >
                          Split
                        </Button>
                      </div>
                    )}
                    <ScrollShadow className="editScrollShow absolute left-2 right-2 bottom-10 top-12 text-base p-3 resize-none rounded-md border-solid border-inherit bg-slate-50 dark:bg-gray-800">
                      <div className="flex w-full h-full bg-slate-50 dark:bg-gray-200 rounded-lg p-2">
                        <textarea
                          ref={textareaRef}
                          className="flex-1 p-3 resize-none rounded-md border border-transparent bg-slate-50 dark:bg-gray-200 text-gray-900"
                          value={
                            (chapters.length > 0 &&
                              chapters.find(
                                (chapter) => chapter.id === activeChapter
                              )?.content) ||
                            ""
                          }
                          onChange={(e) => {
                            const updatedChapters = chapters.map((chapter) =>
                              chapter.id === activeChapter
                                ? { ...chapter, content: e.target.value }
                                : chapter
                            );
                            setChapters(updatedChapters);
                          }}
                        />
                      </div>
                    </ScrollShadow>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
