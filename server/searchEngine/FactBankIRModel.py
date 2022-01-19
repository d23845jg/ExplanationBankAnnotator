import heapq

import numpy as np
import requests
import torch
from sklearn.metrics.pairwise import cosine_similarity
from transformers import DPRContextEncoder, DPRContextEncoderTokenizer, DPRQuestionEncoder, DPRQuestionEncoderTokenizer


# Mean Pooling - Take attention mask into account for correct averaging
def mean_pooling(model_output, attention_mask):
    # First element of model_output contains all token embeddings
    token_embeddings = model_output[0]
    # token_embeddings = model_output.last_hidden_state
    input_mask_expanded = (
        attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    )
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    return sum_embeddings / sum_mask


# Retrieve Fact -----------------------------------------------------------------------------------------------------------------------
class RetrieveFact:
    def __init__(
        self, query_tok_path, query_ber_path, context_tok_path, context_ber_path
    ):
        self.query_tok, self.query_ber = DPRQuestionEncoderTokenizer.from_pretrained(query_tok_path), torch.load(query_ber_path)
        print("Quey BERT model loaded")
        
        self.context_tok, self.context_ber = DPRContextEncoderTokenizer.from_pretrained(context_tok_path),DPRContextEncoder.from_pretrained(context_ber_path)
        print("Context BERT model loaded")

    def retrieve(self, query):
        encoded_input = self.query_tok(
            [query], padding=True, truncation=True, max_length=512, return_tensors="pt"
        )
        with torch.no_grad():
            model_output = self.query_ber(encoded_input['input_ids'])
        query_embedding = (
            model_output.pooler_output.detach().numpy()
        )

        all_facts_with_embeddings = requests.get("http://fact-curation:8081/facts").json()
        # all_facts_with_embeddings = requests.get("http://localhost:8081/facts").json()

        filtered_facts_df = []
        filtered_sentence_embeddings = []
        for fact in all_facts_with_embeddings:
            embedding = fact.pop("Embedding", [])
            filtered_facts_df.append(fact)
            filtered_sentence_embeddings.append(embedding[0])
        filtered_sentence_embeddings = np.array(filtered_sentence_embeddings)

        cos_sim = cosine_similarity(query_embedding, filtered_sentence_embeddings)[0].tolist()

        # def validate(value):
        #     return value if not pd.isna(value) else 'NaN'

        return [
            {
                "cosine_similarity": cos_sim[i],
                "_id": filtered_facts_df[i]["_id"],
                # self.breastcancer_facts_df.statement[i],
                "Statement": filtered_facts_df[i]["Statement"],
                "Resource": "",  # self.breastcancer_facts_df.resource[i],
                # 'LoE/GoR':self.breastcancer_facts_df.LoE/GoR[i],
                # validate(self.breastcancer_facts_df.consensus[i]),
                "Consensus": "",
                # validate(self.breastcancer_facts_df.type[i]),
                "Type": filtered_facts_df[i]["Type"],
                # validate(self.breastcancer_facts_df.section[i])
                "Section": "",
            }
            for i in heapq.nlargest(
                30, range(len(filtered_facts_df)), key=lambda i: cos_sim[i]
            )
        ]

    def findEmbedding(self, statement):
        encoded_input = self.context_tok(
            [statement],
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt",
        )
        with torch.no_grad():
            model_output = self.context_ber(encoded_input['input_ids'])
        query_embedding = (
            model_output.pooler_output.detach().numpy().tolist()
        )

        return {"Embedding": query_embedding}
