// import { join, dirname } from "path";
// import { Low, JSONFile } from "lowdb-node";
// import { fileURLToPath } from "url";

// const __dirname = dirname(fileURLToPath(import.meta.url));

// const file = join(__dirname, "../../public/generated-data/", "db.json");
// const adapter = new JSONFile(file);
// export const db = new Low(adapter);

// export const transaction = async (fnc) => {
//   await db.read();
//   db.data = db.data || {};
//   db.data.post = db.data.post || [];

//   //
//   db.data.projectsMap = db.data.projectsMap || {};

//   //
//   db.data.nodesMap = db.data.nodesMap || {};

//   await fnc(db);

//   await db.write();
// };
