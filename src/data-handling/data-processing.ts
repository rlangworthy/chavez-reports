import * as handles from './data-interfaces'

/*
 *Data Processing Loop
 *
 * As files are added we want to update the internal database as appropriate 
 * and make reports available based on that.  This should consolidate a lot of
 * the aggregation and simplify report creation.
 * 
 * Each time a new file of a specific type is uploaded we check if it can be
 * used immediately either adding it to the internal database or placing it in
 * a buffer until it can be used. New files overwrite old ones of the same 
 * type, 
 */

