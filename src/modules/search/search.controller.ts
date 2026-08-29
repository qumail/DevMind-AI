import { Request, Response } from "express";

import {
  SearchService,
} from "./search.service";

import {
  SearchRequest,
} from "./search.types";

export class SearchController {
  constructor(
    private readonly searchService: SearchService
  ) {}

  search = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const {
        query,
        limit,
        documentId,
        fileName,
        extension,
      } = req.body as SearchRequest;

      if (
        typeof query !== "string"
      ) {
        res.status(400).json({
          message:
            "query must be a string",
        });

        return;
      }

      const result =
        await this.searchService.search({
          query,

          limit:
            typeof limit === "number"
              ? limit
              : undefined,

          documentId,

          fileName,

          extension,
        });

      res.status(200).json(
        result
      );
    } catch (error) {
      console.error(
        "Search failed:",
        error
      );

      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Search failed",
      });
    }
  };
}