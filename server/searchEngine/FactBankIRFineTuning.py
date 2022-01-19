import math
import random
import shutil
from os import listdir
from os.path import isfile, join

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from transformers import BertModel, BertTokenizer


class Model(nn.Module):
    def __init__(self, ber):
        super(Model, self).__init__()
        self.bert = ber
        self.loss = nn.CosineEmbeddingLoss()

    def forward(self, queries, context_vectors, labels):
        query_vectors = self.bert(
            **queries, output_attentions=False, output_hidden_states=False
        ).pooler_output
        loss = self.loss(query_vectors, context_vectors, labels * 2 - 1)
        return loss

class InputSequence:
    def __init__(self, query_tok, context_tok, context_ber, l_query, l_context, l_label, batch_size=64, gpu=False):
        self.data_len = len(l_query)
        self.data_idx = [i for i in range(self.data_len)]
        self.labels = torch.from_numpy(np.array(l_label, dtype=np.int64))
        print("labels done")
        self.queries = query_tok(l_query, padding=True, truncation=True, max_length=512, return_tensors='pt')
        print("queries done")
        self.contexts = context_tok(
            l_context,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt",
        )
        print("contexts done")

        self.batch_size = batch_size
        self.gpu = gpu

        if self.gpu:
            context_ber.cuda()
        self.context_vectors = []
        for batch in range(math.ceil(1.0 * self.data_len / self.batch_size)):
            start = batch * self.batch_size
            end = min(self.data_len, start + self.batch_size)
            batch_input = dict(
                [
                    (
                        k,
                        (
                            self.contexts[k][start:end].cuda()
                            if self.gpu
                            else self.contexts[k][start:end]
                        ),
                    )
                    for k in self.contexts
                ]
            )
            self.context_vectors.append(
                context_ber(
                    **batch_input, output_attentions=False, output_hidden_states=False
                )
                .pooler_output.cpu()
                .detach()
                .numpy()
            )
            del batch_input
            print(end, "/", self.data_len, "done", end="\r")
        context_ber.cpu()
        self.context_vectors = torch.from_numpy(
            np.concatenate(self.context_vectors, axis=0).astype(np.float32)
        )

    def on_epoch_end(self):
        random.shuffle(self.data_idx)

    def __getitem__(self, i):
        start = i * self.batch_size
        batch_idx = self.data_idx[start : min(start + self.batch_size, self.data_len)]

        return_labels = self.labels[batch_idx]
        return_queries = dict([(k, self.queries[k][batch_idx]) for k in self.queries])
        return_context_vectors = self.context_vectors[batch_idx]

        if self.gpu:
            return_labels = return_labels.cuda()
            return_queries = dict(
                [(k, return_queries[k].cuda()) for k in return_queries]
            )
            return_context_vectors = return_context_vectors.cuda()
        return return_queries, return_context_vectors, return_labels

    def __len__(self):
        return math.ceil(1.0 * self.data_len / self.batch_size)


class FineTuning:
    def train(
        self,
        train_data_path,
        used_data_path,
        query_tok_path,
        query_ber_path,
        context_tok_path,
        context_ber_path,
    ):
        # query_tok, query_ber = torch.load(query_tok_path), torch.load(query_ber_path)
        query_tok, query_ber = BertTokenizer.from_pretrained(query_tok_path), BertModel.from_pretrained(query_ber_path)
        print("Quey BERT model loaded")
        # context_tok, context_ber = torch.load(context_tok_path), torch.load(context_ber_path)
        context_tok, context_ber = BertTokenizer.from_pretrained(context_tok_path), BertModel.from_pretrained(context_ber_path)
        print("Context BERT model loaded")

        query, statement, label = [], [], []
        for file in listdir(train_data_path):
            file_path = join(train_data_path, file)
            if isfile(file_path):
                train_df = pd.read_csv(file_path)
                query += train_df.question.tolist()
                statement += train_df.statement.tolist()
                label += train_df.label.tolist()
                shutil.move(file_path, join(used_data_path, file))
        training_data = InputSequence(query_tok, context_tok, context_ber, query, statement, label, batch_size=32)

        # model=Model(query_ber).cuda()
        model=Model(query_ber)
        optimizer = torch.optim.Adam(model.parameters(), lr=3e-5)
        total_epoch_num = 5
        for epoch in range(total_epoch_num):
            training_data.on_epoch_end()
            loss_sum = 0.0
            loss_count = 0
            for batch in range(len(training_data)):
                optimizer.zero_grad()
                batch_queries,batch_context_vectors,batch_labels=training_data[batch]
                #print(a,b)
                loss_count+=len(batch_labels)
                #loss,p_exp,n_exp = model(
                loss = model(batch_queries,batch_context_vectors,batch_labels)
                #print('epoch:',epoch,'batch:',batch,'loss:',loss.item(),"pos exp:",p_exp.item(),"neg exp:",n_exp.item(),end='\n')
                print('epoch:',epoch,'batch:',batch,'loss:',loss.item(),end='\n' if batch==0 or batch+1==len(training_data) or (batch+1)%100==0 else '\r')
                loss_sum += loss.item()
                loss.backward()
                optimizer.step()
            print(epoch+1,1.0*loss_sum/loss_count,end='\n' if epoch==0 or epoch+1==total_epoch_num or (epoch+1)%1==0 else '\r')

        # torch.save(model.bert, query_ber_path)
        model.bert.save_pretrained(query_ber_path)
