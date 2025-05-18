export interface Article {
    stock_Minimum: number;
    id: string;
    reference: string;
    designation: string;
    stock: number;
    uniteId: string;
    unite: Unite;
    familleId: string;
    famille: Famille;
    puHt: number;
    montantHt: number;
}
export interface ArticleCreateRequest {
    reference: string;
    designation: string;
    stock: number;
    stock_Minimum: number;
    uniteId: string;
    familleId: string;
    puHt: number;
    montantHt: number;
}
export interface Unite {
    abreviation: string;
    id: string;
    nom: string;
} 
export interface Famille {
    id: string;
    tva: number;
    nom: string;
}


