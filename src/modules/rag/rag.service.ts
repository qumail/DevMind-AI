import {
    ragChain,
   // ragRetriever,
} from "./chains/rag.chain";

import {
    Document,
} from "@langchain/core/documents";

import {
    ChatResponse,
    ChatSource,
} from "../chat/chat.types";

import { QdrantRetriever } from './retriever/qdrant.retriever';

export class RagService {
    async answer(
        question: string,

        options?: {
            topK?: number;
            documentId?: string;
            fileName?: string;
            extension?: string;
        }
    ): Promise<ChatResponse> {
        const retriever =
            new QdrantRetriever(options);

        const documents =
            await retriever.invoke(
                question
            );

        const context =
            this.buildContext(
                documents
            );

        const answer =
            await ragChain.invoke({
                question,

                context,
            });

        return {
            question,

            answer,

            sources:
                this.buildSources(
                    documents
                ),
        };
    }

    private buildContext(
        documents: Document[]
    ): string {
        return documents
            .map(
                (
                    document,
                    index
                ) => {
                    return `
[Source ${index + 1}]

File:
${document.metadata.fileName}

Chunk:
${document.metadata.chunkIndex}

Content:
${document.pageContent}
`;
                }
            )
            .join(
                "\n----------------------\n"
            );
    }

    private buildSources(
        documents: Document[]
    ): ChatSource[] {
        return documents.map(
            (document) => ({
                documentId:
                    String(
                        document.metadata
                            .documentId
                    ),

                chunkId:
                    String(
                        document.metadata
                            .chunkId
                    ),

                chunkIndex:
                    Number(
                        document.metadata
                            .chunkIndex
                    ),

                fileName:
                    String(
                        document.metadata
                            .fileName
                    ),

                score:
                    Number(
                        document.metadata
                            .score ?? 0
                    ),
            })
        );
    }
}