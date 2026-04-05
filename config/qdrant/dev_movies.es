PUT /collections/dev_movies 
{
  "vectors": {
    "overview-dense-vector": {
      "size": 384,
      "distance": "Cosine",
      "on_disk": true,
      "hnsw_config": {
        "m": 24,
        "payload_m": 24,
        "ef_construct": 256
      },
      "datatype": "float32"
    }
  },
  "quantization_config": {
    "scalar": {
      "type": "int8",
      "always_ram": true
    }
  }
}

// Payload Indexes
PUT /collections/dev_movies/index 
{
  "field_name": "genres",
  "field_schema": "keyword"
}

PUT /collections/dev_movies/index 
{
  "field_name": "original_language",
  "field_schema": "keyword"
}

PUT /collections/dev_movies/index 
{
  "field_name": "status",
  "field_schema": "keyword"
}

PUT /collections/dev_movies/index 
{
  "field_name": "adult",
  "field_schema": "bool"
}

PUT /collections/dev_movies/index 
{
  "field_name": "vote_average",
  "field_schema": "float"
}

PUT /collections/dev_movies/index 
{
  "field_name": "vote_count",
  "field_schema": "integer"
}

PUT /collections/dev_movies/index 
{
  "field_name": "release_date",
  "field_schema": "datetime"
}

PUT /collections/dev_movies/index 
{
  "field_name": "runtime",
  "field_schema": "integer"
}

PUT /collections/dev_movies/index 
{
  "field_name": "popularity",
  "field_schema": "float"
}

PUT /collections/dev_movies/index 
{
  "field_name": "title",
  "field_schema": {
    "type": "text",
    "tokenizer": "word",
    "min_token_len": 2,
    "max_token_len": 50,
    "lowercase": true
  }
}

PUT /collections/dev_movies/index 
{
  "field_name": "original_title",
  "field_schema": {
    "type": "text",
    "tokenizer": "word",
    "min_token_len": 2,
    "max_token_len": 50,
    "lowercase": true
  }
}