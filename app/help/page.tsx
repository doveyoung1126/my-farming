import { Accordion } from '@/components/ui/Accordion';
import { FeedbackForm } from '@/components/features/help/FeedbackForm';

const faqItems = [
  {
    question: '什么是“生产周期” (Cycle)？',
    answer: (
      <p>
        您可以把一个“生产周期”想象成一个<strong>独立的生产档案</strong>或<strong>日志本</strong>。
        它从您“播种”（或任何标记为“开始”的活动）那一刻开始，到您“采收”（或任何标记为“结束”的活动）那一刻结束。这期间发生的所有农事活动、成本支出和销售收入，都会被自动记录到这个“档案”里。
        <br /><br />
        它的好处是：您可以非常清晰地看到<strong>每一次</strong>种植（例如“2024年春季的番茄”）的总投入、总产出和最终利润，而不会和其他种植批次混淆。
      </p>
    ),
  },
  {
    question: '为什么我必须先进行“播种”活动，才能记录“施肥”、“浇水”等活动？',
    answer: (
      <p>
        这正是本应用的核心设计理念，目的是为了保证数据的<strong>准确无误</strong>。
        将“播种”活动看作是为新一批作物<strong>“开启一个生产档案”</strong>的动作。只有先开了档案，后续的“施肥”、“浇水”等活动才能准确地记录到这个新档案中。
        <br /><br />
        如果您可以直接记录“施肥”，系统就不知道这次施肥是属于哪个种植批次的，数据就可能会变得混乱。这个小小的限制，换来的是您年底复盘时清晰、可靠的数据。
      </p>
    ),
  },
  // ... more FAQ items can be added here
];

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-sm border border-slate-200">
    <div className="p-4 border-b border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
    </div>
    <div className="p-4 prose prose-slate max-w-none">
      {children}
    </div>
  </div>
);

export default function HelpPage() {
  return (
    <div className="h-full bg-slate-50 overflow-y-auto pb-20">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-800">帮助中心</h1>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 md:p-6 space-y-8">
        <SectionCard title="常见问题 (FAQ)">
          <Accordion items={faqItems} />
        </SectionCard>

        <SectionCard title="重要使用建议">
          <h4>请谨慎操作“开始”与“结束”活动</h4>
          <p>“播种”和“采收”是管理生产周期的关键。<strong>我们强烈建议您不要轻易删除这些活动</strong>。</p>
          <ul>
            <li><strong>删除“播种”活动</strong>：可能会导致该周期的所有后续活动变成无主的“孤儿数据”，从而在统计中被忽略。</li>
            <li><strong>删除“采收”活动</strong>：可能会导致一个本已完成的周期变回“进行中”状态，影响您的数据准确性。</li>
          </ul>
          <p><strong>正确做法</strong>：如果您确实需要修改开始或结束日期，我们建议您使用<strong>编辑</strong>功能来调整日期，而不是删除重建。</p>
          <br />

          <h4>数据准确性是您的宝贵财富</h4>
          <p>“随手记”是本应用的核心价值。我们鼓励您在每次农事活动发生后或每笔开销产生后，尽快记录。及时、准确的数据，才能在未来给您带来最有价值的分析和回顾。</p>
          <br />

          <h4>慎重“添加财务记录”</h4>
          <p>添加财务记录是为了记录单独的财务支出，这类支出可能无法关联到具体的农事活动上，例如“维修拖拉机”。通常情况我们强烈建议您使用<strong>添加农事活动</strong>来记录您的各项活动并关联财务记录。</p>
          <br />

          <h4>善用“归档”功能</h4>
          <p>对于不再使用的地块，请使用“归档”功能而不是删除。归档会将其从主要列表中隐藏，但完整保留其所有的历史生产数据，方便您未来随时查阅。</p>
        </SectionCard>

        <SectionCard title="关于本应用">
          <h4>开发初衷</h4>
          <p>本应用由一名热爱技术的开发者为家人设计，旨在将现代技术应用于传统农业，用简洁的工具替代繁琐的纸笔，让农事管理变得轻松、高效。</p>
          <h4>核心设计理念</h4>
          <p>我们的核心理念是‘以农事活动为中心’。我们相信，只要真实、准确地记录下每一次农事操作，所有关于成本、利润和周期的数据都应该是自动生成、水到渠成的。因此，我们简化了所有不必要的操作，让您只需专注于记录您最熟悉的农事活动。</p>
        </SectionCard>

        <SectionCard title="联系与反馈">
          <p>作为本应用的第一个版本，它必然存在许多可以改进之处。如果您在使用过程中遇到任何问题，或有任何宝贵的建议，都非常欢迎您随时与我联系。</p>
          <FeedbackForm />
        </SectionCard>
      </main>
    </div>
  );
}
