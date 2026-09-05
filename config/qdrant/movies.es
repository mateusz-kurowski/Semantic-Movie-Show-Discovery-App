// Canonical Qdrant schema for the PROD `movies` collection.
// Ownership: keep in agreement with the ingester's CreateCollection
// (catalog-ingester/search.go) and catalog-api's vector/payload expectations.
// Covered by the qdrant-consistency skill. Apply top-to-bottom after
// DELETE /collections/movies. Dev counterpart: dev_movies.es (identical
// except the collection name).
PUT /collections/movies
{
  "vectors": {
    "overview-dense-vector": {
      "size": 256,
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
  "sparse_vectors": {
    "overview-sparse-vector": {
      "index": {
        "on_disk": true
      },
      "modifier": "idf"
    }
  },
  "quantization_config": {
    "scalar": {
      "type": "int8",
      "always_ram": true
    }
  },
  "on_disk_payload": true
}

// Payload Indexes
PUT /collections/movies/index
{
  "field_name": "genres",
  "field_schema": "keyword"
}

PUT /collections/movies/index
{
  "field_name": "keywords",
  "field_schema": "keyword"
}

PUT /collections/movies/index
{
  "field_name": "original_language",
  "field_schema": "keyword"
}

PUT /collections/movies/index
{
  "field_name": "status",
  "field_schema": "keyword"
}

PUT /collections/movies/index
{
  "field_name": "adult",
  "field_schema": "bool"
}

PUT /collections/movies/index
{
  "field_name": "vote_average",
  "field_schema": "float"
}

PUT /collections/movies/index
{
  "field_name": "vote_count",
  "field_schema": "integer"
}

PUT /collections/movies/index
{
  "field_name": "release_date",
  "field_schema": "datetime"
}

PUT /collections/movies/index
{
  "field_name": "runtime",
  "field_schema": "integer"
}

PUT /collections/movies/index
{
  "field_name": "popularity",
  "field_schema": "float"
}

PUT /collections/movies/index
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

PUT /collections/movies/index
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

PUT /collections/movies/index
{
  "field_name": "original_id",
  "field_schema": "integer"
}
