export type SabreConfiguration = SabreConfigurationBase;

/**
 * The configuration for a new {@link Sabre} instance
 */
interface SabreConfigurationBase {
    /**
     * Metadata location for the files: injection.meta.json and injection.mapper.js
     *
     * it defaults to the outDir in the tsconfig.json
     */
    metadataDirectory?: string;
}
