package cmd

import (
	"fmt"
	"sort"
	"strings"

	"github.com/kickplate/cli/cmd/generate"
	"github.com/spf13/cobra"
)

var describeCmd = &cobra.Command{
	Use:   "describe [slug]",
	Short: "Show details of a plate",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		s, err := NewSession(cmd)
		if err != nil {
			return err
		}

		var p PlateDetail
		if err := s.GetJSON("/plates/"+args[0], nil, &p); err != nil {
			return err
		}

		fmt.Printf("Name:         %s\n", p.Name)
		fmt.Printf("Slug:         %s\n", p.Slug)
		fmt.Printf("Category:     %s\n", p.Category)
		fmt.Printf("Status:       %s\n", p.Status)
		fmt.Printf("Visibility:   %s\n", p.Visibility)

		if d := deref(p.Description); d != "" {
			fmt.Printf("Description:  %s\n", d)
		}
		if r := deref(p.RepoURL); r != "" {
			fmt.Printf("Repo:         %s\n", r)
		}
		if b := deref(p.Branch); b != "" {
			fmt.Printf("Branch:       %s\n", b)
		}

		fmt.Printf("Stars:        %d\n", p.StarCount)
		fmt.Printf("Verified:     %s\n", boolYesNo(p.IsVerified))

		if len(p.Tags) > 0 {
			tags := make([]string, len(p.Tags))
			for i, t := range p.Tags {
				tags[i] = t.Tag
			}
			fmt.Printf("Tags:         %s\n", strings.Join(tags, ", "))
		}

		if p.Owner != nil {
			name := deref(p.Owner.Username)
			if name == "" {
				name = deref(p.Owner.DisplayName)
			}
			if name != "" {
				fmt.Printf("Owner:        %s\n", name)
			}
		}

		if p.Organization != nil {
			fmt.Printf("Organization: %s\n", p.Organization.Name)
		}

		fmt.Printf("Created:      %s\n", p.CreatedAt)
		fmt.Printf("Updated:      %s\n", p.UpdatedAt)

		schema, schemaErr := generate.FetchServerSchema(cmd, args[0])
		if schemaErr == nil {
			if len(schema.Schema) > 0 {
				fmt.Println("\n── Schema " + strings.Repeat("─", 50))
				hasValues := false
				for _, f := range schema.Schema {
					if len(f.Values) > 0 {
						hasValues = true
						break
					}
				}
				var t *Table
				if hasValues {
					t = NewTable("FIELD", "TYPE", "REQUIRED", "DEFAULT", "VALUES")
				} else {
					t = NewTable("FIELD", "TYPE", "REQUIRED", "DEFAULT")
				}
				keys := make([]string, 0, len(schema.Schema))
				for k := range schema.Schema {
					keys = append(keys, k)
				}
				sort.Strings(keys)
				for _, k := range keys {
					f := schema.Schema[k]
					def := ""
					if f.Default != nil {
						def = fmt.Sprintf("%v", f.Default)
					}
					if hasValues {
						t.Row(k, f.Type, boolYesNo(f.Required), def, strings.Join(f.Values, ", "))
					} else {
						t.Row(k, f.Type, boolYesNo(f.Required), def)
					}
				}
				t.Print()
			}

			if len(schema.Modules) > 0 {
				fmt.Println("\n── Modules " + strings.Repeat("─", 49))
				t := NewTable("MODULE", "DEFAULT")
				mkeys := make([]string, 0, len(schema.Modules))
				for k := range schema.Modules {
					mkeys = append(mkeys, k)
				}
				sort.Strings(mkeys)
				for _, k := range mkeys {
					t.Row(k, boolYesNo(schema.Modules[k].Enabled))
				}
				t.Print()
			}

			if len(schema.Files) > 0 {
				fmt.Println("\n── Files " + strings.Repeat("─", 51))
				t := NewTable("PATH", "CONDITION")
				for _, f := range schema.Files {
					t.Row(f.Path, f.Condition)
				}
				t.Print()
			}
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(describeCmd)
}
