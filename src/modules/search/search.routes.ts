import {
  Router,
} from "express";

import {
  SearchController,
} from "./search.controller";

import {
  SearchService,
} from "./search.service";

const router =
  Router();

const searchService =
  new SearchService();

const searchController =
  new SearchController(
    searchService
  );

router.post(
  "/",
  searchController.search
);

export default router;