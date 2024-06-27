import { join, dirname } from "path";
import { fileURLToPath } from "url";
import openInEditor from "open-in-editor";
import fs from "fs/promises";
import slugify from "slugify";

export async function openEditorCoder({ title, nodeTitle }) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  let sTitle = slugify(title, {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: "hk", // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });

  let folder = `${join(
    __dirname,
    "../../",
    "src/effectnode/projects/",
    sTitle,
    "/codes"
  )}`;

  let list = await fs.opendir(folder);
  for await (let dir of list) {
    if (dir.name.includes(nodeTitle)) {
      //
      let sourceDir = `${join(
        __dirname,
        "../../",
        "src/effectnode/projects/",
        sTitle,
        "/codes",
        `${dir.name}`
      )}`;

      let editor = openInEditor.configure({
        editor: "code",
      });

      await editor.open(sourceDir);

      return { ok: true };
    }
  }

  return { ok: true };
}
