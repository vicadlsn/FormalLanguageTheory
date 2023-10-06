// <init> ::= '^' <regex> '$' | '^$'
// <regex> ::= <concatenation> '|' <regex> | <concatenation>
// <concatenation> ::= <iteration><concatenation> | <iteration>
// <iteration> ::= <group> '*' | <group> | '(?=' <lookahead> ')'
// <group> ::= '(' <regex> ')' | <symbol>
// <lookahead> ::= <regex> | <regex> '$'

import { getRandom } from "./random";

type Options = {
    lettersLeft: number,
    iterationsLeft: number,
    noLookaheads: boolean,
    followedByConcatenation: boolean,
}

export class RegexGenerator {
    private readonly alphabet = ['a', 'b', 'c', 'd', 'e'];

    private lookaheadsLeft: number;
    private lettersUsed: number;
    private currentSequenceNesting: number;
    private maxSequenceNesting: number = 1;

    constructor(
        private readonly alphabetSize: number,
        private readonly maxStarHeight: number,
        private readonly maxLookaheadsNumber: number,
        private readonly maxLettersNumber: number,
    ) {
        if (alphabetSize > this.alphabet.length) this.alphabetSize = this.alphabet.length;
        if (alphabetSize < 0) this.alphabetSize = 0;
        if (maxStarHeight < 0) this.maxStarHeight = 0;
        if (maxLookaheadsNumber < 0) this.maxLookaheadsNumber = 0;
        if (maxLettersNumber < 0) this.maxLettersNumber = 0;
    }

    private init(): void {
        this.lookaheadsLeft = this.maxLookaheadsNumber;
        this.lettersUsed = 0;
        this.currentSequenceNesting = 0;
    }

    generate(): string {
        this.init();

        return this.expandInit()
    }

    private expandInit(): string {
        if (this.maxLettersNumber == 0) {
            return '^$';
        }

        let res: string = '^' + this.expandRegex({  lettersLeft: this.maxLettersNumber, iterationsLeft: this.maxStarHeight, noLookaheads: false, followedByConcatenation: false   });

        while (/*this.lookaheadsLeft > 0 ||*/ this.lettersUsed < this.maxLettersNumber) {
            res += '|' + this.expandRegex({ lettersLeft: this.maxLettersNumber - this.lettersUsed, iterationsLeft: this.maxStarHeight, noLookaheads: false, followedByConcatenation: false });
        }

        return res + '$';
    }

    private expandRegex(options: Options): string {
        let next: Options = {
            lettersLeft: options.lettersLeft,
            iterationsLeft: options.iterationsLeft,
            noLookaheads: options.noLookaheads,
            followedByConcatenation: options.followedByConcatenation,
        }

        if (options.lettersLeft < 2 || getRandom(0, 2)) {
            return this.expandConcatenation(next);
        }

        this.currentSequenceNesting = 0 ;
        next.noLookaheads = options.followedByConcatenation ?  true : options.noLookaheads;
        next.lettersLeft--;
        let left: string = this.expandConcatenation(next);

        this.currentSequenceNesting = 0;
        next.lettersLeft = options.lettersLeft - this.lettersUsed;
        let right: string = this.expandConcatenation(next);

        return left + '|' + right;
    }

    private expandConcatenation(options: Options): string {
        let next: Options = {
            lettersLeft: options.lettersLeft,
            iterationsLeft: options.iterationsLeft,
            noLookaheads: options.noLookaheads,
            followedByConcatenation: options.followedByConcatenation,
        }

        if (options.lettersLeft < 2 || getRandom(0, 2)) {
            return this.expandIteration(next);
        }

        this.currentSequenceNesting = 0;
        next.lettersLeft--;
        next.followedByConcatenation = true;
        let left: string = this.expandIteration(next);

        this.currentSequenceNesting = 0 ;
        this.currentSequenceNesting = 0 ;
        next.lettersLeft = options.lettersLeft - this.lettersUsed;
        next.followedByConcatenation = options.followedByConcatenation;
        let right: string = this.expandIteration(next);

        return left + right;
    }

    private expandIteration(options: Options): string {
        let startRule: number = 1, endRule: number = 2;

        if (options.iterationsLeft > 0) {
            startRule = 0;
        }

        if (this.lookaheadsLeft > 0 && options.noLookaheads == false) {
            endRule = 3;
        } 

        let rule: number = getRandom(startRule, endRule);

        if (rule == 0) {
            return this.expandGroup({
                lettersLeft: options.lettersLeft,
                iterationsLeft: options.iterationsLeft - 1,
                noLookaheads: true,
                followedByConcatenation: options.followedByConcatenation,
            }) + '*';
        }

        if (rule == 1) {
            return this.expandGroup({
                lettersLeft: options.lettersLeft,
                iterationsLeft: options.iterationsLeft,
                noLookaheads: options.noLookaheads,
                followedByConcatenation: options.followedByConcatenation,
            });
        }

        this.lookaheadsLeft--;
        return '(?=' + this.expandLookahead({
            lettersLeft: options.lettersLeft,
            iterationsLeft: options.iterationsLeft,
            noLookaheads: true,
            followedByConcatenation: options.followedByConcatenation,
        }) + ')';
    }

    private expandGroup(options: Options): string {
        if (getRandom(0, 2) == 0) {
            return this.symbol();
        }    
        
        if (this.currentSequenceNesting == this.maxSequenceNesting) {
            return this.symbol();
        }

        this.currentSequenceNesting++;

        return '(' + this.expandRegex({
            lettersLeft: options.lettersLeft,
            iterationsLeft: options.iterationsLeft, 
            noLookaheads: options.noLookaheads, 
            followedByConcatenation: options.followedByConcatenation,
        }) + ')';
    }

    private symbol(): string {
        this.lettersUsed++;
        return this.alphabet[getRandom(0, this.alphabetSize)];
    }

    private expandLookahead(options: Options): string {
        this.currentSequenceNesting = 0;

        let rule: number = getRandom(0, 2);

        if (rule == 0) {
            return this.expandRegex({
                lettersLeft: options.lettersLeft,
                iterationsLeft: options.iterationsLeft,
                noLookaheads: options.noLookaheads,
                followedByConcatenation: options.followedByConcatenation,
            });
        }

        return this.expandRegex({
            lettersLeft: options.lettersLeft,
            iterationsLeft: options.iterationsLeft,
            noLookaheads: options.noLookaheads,
            followedByConcatenation: options.followedByConcatenation,
        }) + '$';
    }
}