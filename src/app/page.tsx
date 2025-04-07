import TextEditor from "./components/text.editor";

export default function CreateBlog() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WYSIWYG Editor with Tiptap (Example)</h1>
      <div className="w-full h-full bg-white rounded-lg p-4">
        <TextEditor />
      </div>
    </div>
  );
}
