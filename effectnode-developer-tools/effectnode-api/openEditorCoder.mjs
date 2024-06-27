import { join, dirname } from "path";
import { fileURLToPath } from "url";
import openInEditor from "open-in-editor";

export async function openEditorCoder({ title, nodeTitle }) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  let sourceDir = `${join(
    __dirname,
    "../../",
    "src/effectnode/template/project",
    "/",
    `${title}`,
    `codes`,
    `${nodeTitle}`
  )}`;

  let editor = openInEditor.configure({
    editor: "code",
  });

  await editor.open(sourceDir);

  return { ok: true };
}
