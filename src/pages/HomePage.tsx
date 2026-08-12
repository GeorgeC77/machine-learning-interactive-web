import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, ChevronRight, ShieldAlert } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { courseManifest, type Chapter } from '@/course/manifest';

function getChapterEntryPath(chapter: Chapter): string {
  return chapter.sections[0]?.path || '/';
}

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero */}
      <section className="text-center py-14 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-9 h-9 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          机器学习交互式课程
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
          一套面向机器学习初学者的交互式学习网站。
          从监督学习到强化学习，逐章深入理解机器学习的核心思想与算法。
        </p>

        {/* Copyright banner */}
        <p className="mt-6 text-sm text-amber-700 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          本内容仅供教学与非商业学习使用，完整授权说明见页脚。
        </p>

      </section>

      {/* Course Directory */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">课程目录</h2>
        </div>

        <Accordion type="multiple" defaultValue={['part-i']} className="w-full">
          {courseManifest.map((part) => {
            return (
              <AccordionItem key={part.id} value={part.id} className="border border-gray-200 rounded-xl mb-4 px-5 data-[state=open]:shadow-sm">
                <AccordionTrigger className="text-lg font-bold text-gray-900 hover:no-underline py-5">
                  <div className="flex items-center gap-3 text-left">
                    <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold border border-blue-200">
                      第{part.number}部分
                    </span>
                    <div>
                      <div className="text-base md:text-lg">{part.title}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
                    {part.chapters.map((chapter) => {
                      const entryPath = getChapterEntryPath(chapter);

                      return (
                        <Link
                          key={chapter.id}
                          to={entryPath}
                          className="group flex items-start gap-3 p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex-grow min-w-0">
                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {chapter.number}. {chapter.title}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-1" />
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>

      {/* License footer block */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <ShieldAlert className="w-6 h-6 text-amber-600" />
          <h3 className="text-lg font-bold text-amber-900">非商业用途</h3>
        </div>
        <p className="text-amber-800 text-sm leading-relaxed">
          本站所有原创内容版权归作者所有。你可以自由阅读、分享和用于个人学习，但禁止未经授权的商业使用。
          转载或引用请注明出处并遵守 CC BY-NC 4.0 许可协议。
        </p>
      </section>
    </div>
  );
}
