# Explanation Bank Annotator

A human-in-the-loop system used to improve inference performance by fine-tuning a language model using explanation trees.

## Architecture Diagram
![Architecture Diagram](docscr/Explanation_Bank_Annotator_Architecture.jpg)
This end-to-end system contains functionality to:
* Upload Facts: allows to upload unstructured data through a CSV file. The only requirement is for the header "Statement" to contain the facts and the header "Type" its type (e.g. definition, guideline, statement etc.); all other attributes will be stored but not used when inferring.
* View All Facts: a table will display all stored facts where filtering, edits and deletions can be performed.
* Perform Inference search: retrieve top-ranked relevant facts given a hypothesis using the retrieval model.
* Annotate Results: generate explanation trees based on the known facts returned from the retrieval model to prove the hypothesis.

##  Building the system:
Execute the following command in the initial directory will initialise all services:
```
docker-compose up
```

##  Input files:
To insert data into the tool, you first need to create a CSV file that at least contains the attributes `"Statement"` and `"Type"`.
```
Statement,Type
leo is a kind of constellation,fact
similar means in common,definition
```

##  Explanation Trees
Once an explanation tree has been completed, it is saved in the `data/data_train` directory. Later on when the language model is trained, the files will be moved to the `data/data_used`  directory.