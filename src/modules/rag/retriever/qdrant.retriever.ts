import {
    Embeddings,
} from "@langchain/core/embeddings";

import {
    Document,
} from "@langchain/core/documents";

import {
    BaseRetriever,
} from "@langchain/core/retrievers";

import {
    CallbackManagerForRetrieverRun,
} from "@langchain/core/callbacks/manager";

import {
    qdrant,
} from "../../../infrastructure/qdrant/client";

import {
    env,
} from "../../../config/env";

import {
    EmbeddingService,
} from "../../embeddings/embedding.service";

interface RetrieverOptions {
    topK?: number;

    documentId?: string;

    fileName?: string;

    extension?: string;
}

export class QdrantRetriever
    extends BaseRetriever {
    lc_namespace = [
        "devmind",
        "retriever",
    ];

    private readonly embeddingService =
        new EmbeddingService();

    constructor(
        // private readonly topK: number = 5
        private readonly options: RetrieverOptions = {}
    ) {
        super();
    }

    async _getRelevantDocuments(
        query: string,

        _runManager?: CallbackManagerForRetrieverRun
    ): Promise<Document[]> {
        const vector =
            await this.embeddingService.generateEmbedding(
                query
            );

        const filterConditions: Array<{
            key: string;
            match: {
                value: string;
            };
        }> = [];

        if (this.options.documentId) {
            filterConditions.push({
                key: "documentId",
                match: {
                    value: this.options.documentId,
                },
            });
        }

        if (this.options.fileName) {
            filterConditions.push({
                key: "fileName",
                match: {
                    value: this.options.fileName,
                },
            });
        }

        if (this.options.extension) {
            filterConditions.push({
                key: "extension",
                match: {
                    value: this.options.extension,
                },
            });
        }

        const response =
            await qdrant.query(
                env.qdrant.collectionName,
                {
                    query: vector,

                    limit: Math.min(
                        Math.max(
                            this.options.topK ?? 5,
                            1
                        ),
                        10
                    ),

                    with_payload: true,

                    ...(filterConditions.length > 0
                        ? {
                            filter: {
                                must: filterConditions,
                            },
                        }
                        : {}),
                }
            );
            
        return response.points.map(
            (point) => {
                const payload =
                    point.payload as Record<
                        string,
                        unknown
                    >;

                return new Document({
                    pageContent:
                        String(
                            payload.content ?? ""
                        ),

                    metadata: {
                        documentId:
                            payload.documentId,

                        chunkId:
                            payload.chunkId,

                        chunkIndex:
                            payload.chunkIndex,

                        fileName:
                            payload.fileName,

                        extension:
                            payload.extension,

                        mimeType:
                            payload.mimeType,

                        score:
                            point.score ?? 0,
                    },
                });
            }
        );
    }
}