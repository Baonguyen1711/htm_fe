import { useState, useEffect } from "react";

interface LinkPreviewPanelProps {
  links: string[];
}

export default function LinkPreviewPanel({ links }: LinkPreviewPanelProps) {
  const [previews, setPreviews] = useState<any[]>([]);

  useEffect(() => {
    if (!links || links.length === 0) {
      setPreviews([]);
      return;
    }

    const fetchAll = async () => {
      const result: any[] = [];

      for (let url of links) {
        try {
          const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
          const data = await res.json();
          result.push({ url, data: data.data });
        } catch (err) {
          console.error(err);
        }
      }

      setPreviews(result);
    };

    fetchAll();
  }, [links]);

  if (!links || links.length === 0)
    return (
      <div className="text-blue-100 opacity-70 p-4">
        No reference links for this question.
      </div>
    );

  return (
    <div className="space-y-4 p-2">
      {previews.map((item, idx) => (
        <div
          key={idx}
          className="bg-slate-800/80 border border-blue-400/30 rounded-xl overflow-hidden shadow-xl"
        >
          {item.data?.image?.url && (
            <img src={item.data.image.url} className="w-full h-40 object-cover" />
          )}

          <div className="p-4">
            <h4 className="text-white font-semibold">{item.data?.title}</h4>
            <p className="text-blue-200 text-sm mt-1">{item.data?.description}</p>

            <a
              href={item.url}
              target="_blank"
              className="text-blue-300 underline break-all text-sm mt-2 inline-block"
            >
              {item.url}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
