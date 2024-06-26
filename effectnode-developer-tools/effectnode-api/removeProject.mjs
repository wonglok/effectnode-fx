import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import slugify from "slugify";

export const removeProject = async ({ title = "yoyo" }) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  let slugStr = slugify(title, {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: "hk", // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  });

  let fromFolder = `${join(
    __dirname,
    "../../",
    "src/effectnode/projects/",
    slugStr,
    "/"
  )}`;

  fs.rm(fromFolder, {
    recursive: true,
    retryDelay: 10,
    force: true,
  });
  return {};
};
