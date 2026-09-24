package com.doms.doms.exception;
import lombok.Getter;
@Getter public class QuotaExceededException extends RuntimeException{
 private final String plan;private final long limitBytes,usedBytes,remainingBytes,attemptedBytes;
 public QuotaExceededException(String plan,long limit,long used,long attempted){super("Monthly upload allowance exceeded");this.plan=plan;limitBytes=limit;usedBytes=used;remainingBytes=Math.max(0,limit-used);attemptedBytes=attempted;}
}
