import { create } from "zustand";

/*
src/effectnode/projects
*/

export const useDeveloper = create((set, get) => {
  return {
    //
    workspaces: [],
    listAllGraph: () => {
      return fetch(`/devapi/project/listAllGraph`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          //
          //
        }),
      })
        .then((r) => {
          return r.json();
        })
        .then((response) => {
          console.log("project/listAllGraph", response);
          return response;
        })
        .catch((r) => {
          console.error(r);
        });
    },
    //
    listAll: () => {
      return fetch(`/devapi/project/listAll`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          //
          //
        }),
      })
        .then((r) => {
          return r.json();
        })
        .then((response) => {
          console.log("project/listAll", response);
          set({
            workspaces: response,
          });
          return response;
        })
        .catch((r) => {
          console.error(r);
        });
    },

    create: ({ title }) => {
      return fetch(`/devapi/project/create`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          //
          title: title,
          //
        }),
      })
        .then((r) => {
          if (!r.ok) {
            throw new Error(`taken`);
          }
          return r.json();
        })
        .then((response) => {
          console.log("project/create", response);
          return response;
        });
    },

    recycle: ({ title }) => {
      return fetch(`/devapi/project/recycle`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          //
          title: title,
          //
        }),
      })
        .then((r) => {
          return r.json();
        })
        .then((response) => {
          console.log("project/recycle", response);

          return response;
          //
        })
        .catch((r) => {
          console.error(r);
        });
    },

    rename: ({ oldTitle, title }) => {
      return fetch(`/devapi/project/rename`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          //
          oldTitle: oldTitle,
          title: title,
          //
        }),
      })
        .then((r) => {
          if (!r.ok) {
            throw new Error("name-taken");
          }
          return r.json();
        })
        .then((response) => {
          console.log("project/rename", response);

          return response;
          //
        });
    },

    clone: ({ oldTitle, title }) => {
      return fetch(`/devapi/project/clone`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          //
          oldTitle: oldTitle,
          title: title,
          //
        }),
      })
        .then((r) => {
          if (!r.ok) {
            throw new Error("name-taken");
          }
          return r.json();
        })
        .then((response) => {
          console.log("project/clone", response);

          return response;
          //
        });
    },

    hasOne: ({ title }) => {
      return fetch(`/devapi/project/hasOne`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          //
          title: title,
          //
        }),
      })
        .then((r) => {
          return r.json();
        })
        .then((response) => {
          console.log("project/hasOne", response);

          return response;
        })
        .catch((r) => {
          console.error(r);
        });
    },

    getProjectGraph: ({ title }) => {
      return fetch(`/devapi/graph/getProjectGraph`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          //
          title: title,
          //
        }),
      })
        .then((r) => {
          return r.json();
        })
        .then((response) => {
          //
          // console.log(`project/${title}/graph/getProjectGraph`, response);
          //
          return response;
        })
        .catch((r) => {
          console.error(r);
        });
    },
    //

    //
    setProjectGraph: ({ title, json = {} }) => {
      return fetch(`/devapi/graph/setProjectGraph`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          //
          title: title,
          json,
          //
        }),
      })
        .then((r) => {
          return r.json();
        })
        .then((response) => {
          //

          //

          // console.log(`project/${title}/graph/getProjectGraph`, response);

          return response;
        })
        .catch((r) => {
          console.error(r);
        });
    },

    openEditor: ({ title, nodeTitle }) => {
      let url = `/devapi/project/editor`;

      return fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          //
          title: title,
          nodeTitle: nodeTitle,
          //
        }),
      })
        .then((r) => {
          return r.json();
        })
        .then((response) => {
          console.log(`devapi/project/editor`, response);

          return response;
        })
        .catch((r) => {
          console.error(r);
        });
    },

    //
  };
});

//

//

//

//

//
