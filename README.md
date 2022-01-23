# Explanation Bank Annotator

A human-in-the-loop system used to improve inference performance by fine-tuning a language model using explanation trees.

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