package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/kickplate/cli/internal/config"
	"github.com/spf13/cobra"
)

type CLIConfig = config.CLIConfig
type ServerConfig = config.ServerConfig
type AuthConfig = config.AuthConfig

var defaultConfigPath = config.DefaultConfigPath

func LoadConfig(path string) (*CLIConfig, error) {
	return config.Load(path)
}

func SaveConfig(path string, cfg *CLIConfig) error {
	return config.Save(path, cfg)
}

func resolveConfigPath(cmd *cobra.Command) string {
	path, _ := cmd.Root().PersistentFlags().GetString("config")
	if path == "" {
		path = config.DefaultConfigPath
	}
	return path
}

var configCmd = &cobra.Command{
	Use:   "config",
	Short: "Create a default config file",
	Long:  "View or initialize the kikplate CLI configuration file.",
}

var configInitCmd = &cobra.Command{
	Use:   "init",
	Short: "Create a default config file",
	Long:  "Create a default kikplate CLI config file at ~/.kikplate/config.yaml",
	Example: `  kikplate config init
  kikplate config init --file /path/to/config.yaml`,
	RunE: func(cmd *cobra.Command, args []string) error {
		path, _ := cmd.Flags().GetString("file")
		if path == "" {
			path = config.DefaultConfigPath
		}
		dir := filepath.Dir(path)
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return fmt.Errorf("cannot create directory %s: %w", dir, err)
		}
		if _, err := os.Stat(path); err == nil {
			return fmt.Errorf("config file already exists at %s", path)
		}
		defaultCfg := CLIConfig{
			Server: ServerConfig{
				Address: "https://kikplate.dev/api",
			},
		}
		if err := config.Save(path, &defaultCfg); err != nil {
			return fmt.Errorf("cannot write config file: %w", err)
		}
		fmt.Printf("Config file created at %s\n", path)
		return nil
	},
}

var configViewCmd = &cobra.Command{
	Use:   "view",
	Short: "Print current config",
	Long:  "Print the contents of the active kikplate CLI config file.",
	RunE: func(cmd *cobra.Command, args []string) error {
		path, _ := cmd.Root().PersistentFlags().GetString("config")
		if path == "" {
			path = config.DefaultConfigPath
		}
		data, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("cannot read config file %s: %w", path, err)
		}
		fmt.Print(string(data))
		return nil
	},
}

var configSetServerCmd = &cobra.Command{
	Use:   "set-server <address>",
	Short: "Set the server address",
	Example: `  kik config set-server https://kikplate.dev/api
  kik config set-server http://localhost:3001`,
	Args: cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		path := resolveConfigPath(cmd)
		cfg, err := config.Load(path)
		if err != nil {
			cfg = &CLIConfig{Server: ServerConfig{Address: args[0]}}
		} else {
			cfg.Server.Address = args[0]
		}
		if err := config.Save(path, cfg); err != nil {
			return fmt.Errorf("cannot save config: %w", err)
		}
		fmt.Printf("Server set to %s\n", args[0])
		return nil
	},
}

func init() {
	configInitCmd.Flags().StringP("file", "f", "", "Path for the config file (default: ~/.kikplate/config.yaml)")
	configCmd.AddCommand(configInitCmd)
	configCmd.AddCommand(configViewCmd)
	configCmd.AddCommand(configSetServerCmd)
	rootCmd.AddCommand(configCmd)
}
