package generate

type plateYAML = PlateYAML

type PlateYAML struct {
	Name    string                 `yaml:"name" json:"Name"`
	Schema  map[string]SchemaField `yaml:"schema" json:"Schema"`
	Modules map[string]ModuleDef   `yaml:"modules" json:"Modules"`
	Files   []FileEntry            `yaml:"files" json:"Files"`
}

type SchemaField struct {
	Type     string   `yaml:"type" json:"Type"`
	Required bool     `yaml:"required" json:"Required"`
	Values   []string `yaml:"values" json:"Values"`
	Default  any      `yaml:"default" json:"Default"`
}

type ModuleDef struct {
	Enabled bool `yaml:"enabled" json:"Enabled"`
}

type FileEntry struct {
	Path      string `yaml:"path"`
	Template  string `yaml:"template"`
	Condition string `yaml:"condition"`
}
