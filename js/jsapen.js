// 
// implement Approximate-Entropy (ApEn) in JS
// for 0/1 sequences
// validated against apen.cpp
//
function apen(v, M) {
    var Phi = Array(M+1).fill(0);
    var apen=Array(M+1).fill(0);
    var N=v.length;
    var C=Array(N).fill(0);
    
    var d;
    for( let m=1; m<=M+1; m++ ){
        Phi[m-1]=0.0;
        for(let i=0; i<N-m+1; i++){
            C[i]=0.0;
            for(let j=0; j<N-m+1; j++){
                d=0;
                for(let p=0; p<m; p++){
                    if(v[i+p]!=v[j+p]){
                        d=1; break;
                    }
                }
                C[i] += (1-d);
            }
            Phi[m-1] += Math.log(C[i]/(N-m+1));    
        }
        Phi[m-1] *= 1./(N-m+1);
    }
    apen[0] = -Phi[0];
    for(let i=1; i<=M; i++ ){
        apen[i] = Phi[i-1] - Phi[i];  // ApEn(1) = Phi(1)-Phi(2)
    }
    return apen;
}

// normalize by dividing by log(2)
// and multiplying by 100 to get "percentages"
function norm_apen(v,M){
    var ae=apen(v,M);
    var aen=ae.map(function(x){
        return(x/Math.log(2)*100.);
    });
    return(aen);
}
