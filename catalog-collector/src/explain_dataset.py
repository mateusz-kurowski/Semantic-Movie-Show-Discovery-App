from dataset import scan_and_load_dataset

if __name__ == "__main__":
    df = scan_and_load_dataset("dataset/TMDB_movie_dataset_v11.csv")
    described = df.describe()
    described.write_excel("tmdb_describe.csv")
