package movie

type Genre struct {
	ID   int
	Name string
}

func (Genre) TableName() string {
	return "genre"
}

type Company struct {
	ID   int
	Name string
}

func (Company) TableName() string {
	return "company"
}

type Country struct {
	ID   int
	Name string
}

func (Country) TableName() string {
	return "country"
}

type Language struct {
	ID   int
	Name string
}

func (Language) TableName() string {
	return "language"
}

type Keyword struct {
	ID   int
	Name string
}

func (Keyword) TableName() string {
	return "keyword"
}
