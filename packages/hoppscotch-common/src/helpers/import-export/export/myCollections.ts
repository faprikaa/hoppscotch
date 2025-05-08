import { HoppCollection } from "@hoppscotch/data"

export const myCollectionsExporter = (myCollections: HoppCollection[]) => {
  console.log(myCollections)
  return JSON.stringify(myCollections, null, 2)
}

export const myCollectionsExportToOpenAPIObject = (myCollections: HoppCollection[]) => {
  let openAPIObject = {
    openapi: "3.0.0",
    info: {
      title: "My Collections",
      version: "1.0.0",
    },
    paths: {},
  }
}
