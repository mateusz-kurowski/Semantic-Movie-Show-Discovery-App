package main

type Genre struct {
	ID   int
	Name string
}

func (Genre) TableName() string {
	return "genre"
}

func (g Genre) EntityName() string { return g.Name }

type Company struct {
	ID   int
	Name string
}

func (Company) TableName() string {
	return "company"
}

func (c Company) EntityName() string { return c.Name }

type Country struct {
	ID   int
	Name string
}

func (Country) TableName() string {
	return "country"
}

func (c Country) EntityName() string { return c.Name }

type Language struct {
	ID   int
	Name string
}

func (Language) TableName() string {
	return "language"
}

func (l Language) EntityName() string { return l.Name }

type Keyword struct {
	ID   int
	Name string
}

func (Keyword) TableName() string {
	return "keyword"
}

func (k Keyword) EntityName() string { return k.Name }

// NamedEntity is satisfied by any type with an EntityName method.
type NamedEntity interface {
	EntityName() string
}
