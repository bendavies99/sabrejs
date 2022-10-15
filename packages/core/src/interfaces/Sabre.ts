export interface Sabre {
    /**
     * Get an instance from the sabre registry
     *
     * @param [named] The name inside the Sabre Registry if empty it will use T to pick the return value
     * @param <T> The type to get back
     */
    getInstance: <T>(named?: string) => T;
}